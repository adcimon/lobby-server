import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Socket } from 'dgram';
import { Logger, UseFilters, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { RoomService } from '../room/room.service';
import { SessionService } from '../session/session.service';
import { ValidationInterceptor } from '../validation/validation.interceptor';
import { AuthInterceptor } from '../auth/auth.interceptor';
import { UuidInterceptor } from '../validation/uuid.interceptor';
import { PingSchema, GetRoomSchema, CreateRoomSchema, JoinRoomSchema, LeaveRoomSchema } from '../validation/validation.schema';
import { WsExceptionFilter } from '../exception/ws-exception.filter';
import { InvalidTokenException } from '../exception/invalid-token.exception';
import { GenericResponse } from '../response/generic.response';
  
@WebSocketGateway()
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new WsExceptionFilter())
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect
{
    private readonly logger = new Logger("LOBBY");

    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly roomService: RoomService,
        private readonly sessionService: SessionService
    ) { }

    handleConnection( socket: Socket, ...args: any[] )
    {
        // Authenticate the connection using the token URL parameter.
        const params = new URLSearchParams(args[0].url.replace('/','').replace('?', ''));
        const token = params.get('token');

        // Verify the token.
        try
        {
            const payload = this.authService.verify(token);
            if( !payload || !('username' in payload) )
            {
                throw new Error();
            }

            this.logger.log('CONNECTION SUCCESS payload:' + JSON.stringify(payload));

            // Create the session.
            this.sessionService.create(payload.username, socket);
        }
        catch( exception )
        {
            this.logger.log('CONNECTION FAILURE token:' + token);

            exception = new InvalidTokenException();
            socket.send(JSON.stringify(exception.getError()));
            socket.close();

            return;
        }
    }

    handleDisconnect( socket: Socket )
    {
        this.logger.log('DISCONNECTION');
    }

    @SubscribeMessage('ping')
    @UseInterceptors(new ValidationInterceptor(PingSchema), AuthInterceptor, new UuidInterceptor())
    ping(
        @ConnectedSocket() socket: Socket,
        @MessageBody('username') username: string
    ): any
    {
        //this.logger.log('PING' + ' username:' + username);

        return new GenericResponse('pong', { });
    }

    @SubscribeMessage('get_room')
    @UseInterceptors(new ValidationInterceptor(GetRoomSchema), AuthInterceptor, new UuidInterceptor())
    async getRoom(
        @ConnectedSocket() socket: Socket,
        @MessageBody('username') username: string
    ): Promise<any>
    {
        this.logger.log('GET_ROOM' + ' username:' + username);

        try
        {
            const user = await this.userService.getByUsername(username);
            const room = await this.roomService.getByName(user.room.name);

            return new GenericResponse('get_room_response', { room });
        }
        catch( exception )
        {
            return new GenericResponse('get_room_response', { });
        }
    }

    @SubscribeMessage('create_room')
    @UseInterceptors(new ValidationInterceptor(CreateRoomSchema), AuthInterceptor, new UuidInterceptor())
    async createRoom(
        @ConnectedSocket() socket: Socket,
        @MessageBody('username') username: string,
        @MessageBody('name') name: string,
        @MessageBody('password') password: string
    ): Promise<any>
    {
        this.logger.log('CREATE_ROOM' + ' username:' + username + ' name:' + name + ' password:' + password);

        const room = await this.roomService.create(username, name, password);

        return new GenericResponse('create_room_response', { room });
    }

    @SubscribeMessage('join_room')
    @UseInterceptors(new ValidationInterceptor(JoinRoomSchema), AuthInterceptor, new UuidInterceptor())
    async joinRoom(
        @ConnectedSocket() socket: Socket,
        @MessageBody('username') username: string,
        @MessageBody('name') name: string,
        @MessageBody('password') password: string
    ): Promise<any>
    {
        this.logger.log('JOIN_ROOM' + ' username:' + username + ' name:' + name + ' password:' + password);

        const room = await this.roomService.join(username, name, password);

        return new GenericResponse('join_room_response', { room });
    }

    @SubscribeMessage('leave_room')
    @UseInterceptors(new ValidationInterceptor(LeaveRoomSchema), AuthInterceptor, new UuidInterceptor())
    async leaveRoom(
        @ConnectedSocket() socket: Socket,
        @MessageBody('username') username: string
    ): Promise<any>
    {
        this.logger.log('LEAVE_ROOM' + ' username:' + username);

        await this.roomService.leave(username);

        return new GenericResponse('leave_room_response', { });
    }
}
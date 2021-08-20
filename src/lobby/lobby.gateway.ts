import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Socket } from 'dgram';
import { Server } from 'ws';
import { UseFilters, Logger, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { AuthInterceptor } from '../auth/auth.interceptor';
import { UuidInterceptor } from './uuid.interceptor';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { RoomService } from '../room/room.service';
import { WsExceptionFilter } from '../exception/ws-exception.filter';
import { InvalidTokenException } from '../exception/invalid-token.exception';
import { GenericResponse } from '../response/generic.response';
  
@WebSocketGateway()
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new WsExceptionFilter())
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect
{
    private readonly logger = new Logger("LOBBY");

    @WebSocketServer()
    private server: Server;

    private sessions: Map<string, Socket> = new Map;

    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly roomService: RoomService
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

            this.sessions.set(payload.username, socket);
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
    @UseInterceptors(AuthInterceptor, UuidInterceptor)
    ping(
        @ConnectedSocket() socket: Socket,
        @MessageBody('username') username: string
    ): any
    {
        //this.logger.log('PING' + ' username:' + username);

        return new GenericResponse('pong', { });
    }

    @SubscribeMessage('get_room')
    @UseInterceptors(AuthInterceptor, UuidInterceptor)
    async getRoom(
        @ConnectedSocket() socket: Socket,
        @MessageBody('username') username: string
    ): Promise<any>
    {
        this.logger.log('GET_ROOM' + ' username:' + username);

        let user = await this.userService.getByUsername(username);
        const room = await this.roomService.getByName(user.room.name);

        return new GenericResponse('get_room_response', { room });
    }

    @SubscribeMessage('create_room')
    @UseInterceptors(AuthInterceptor, UuidInterceptor)
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
    @UseInterceptors(AuthInterceptor, UuidInterceptor)
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
    @UseInterceptors(AuthInterceptor, UuidInterceptor)
    async leaveRoom(
        @ConnectedSocket() socket: Socket,
        @MessageBody('username') username: string
    ): Promise<any>
    {
        this.logger.log('LEAVE_ROOM' + ' username:' + username);

        const room = await this.roomService.leave(username);

        return new GenericResponse('leave_room_response', { });
    }
}
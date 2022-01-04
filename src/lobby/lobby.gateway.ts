import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { WebSocket } from 'ws';
import { Logger, UseFilters, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';

// Providers.
import { AuthService } from '../auth/auth.service';
import { SessionService } from '../session/session.service';
import { UserService } from '../user/user.service';
import { RoomService } from '../room/room.service';
import { NotificationService } from './notification.service';

// Validation.
import { ValidationInterceptor } from '../validation/validation.interceptor';
import { AuthInterceptor } from '../auth/auth.interceptor';
import { UuidInterceptor } from '../validation/uuid.interceptor';
import { PingSchema, GetRoomSchema, GetRoomsSchema, CreateRoomSchema, JoinRoomSchema, LeaveRoomSchema, KickUserSchema, SendTextSchema } from '../validation/validation.schema';

// Exceptions.
import { WsExceptionFilter } from '../exception/ws-exception.filter';
import { GenericErrorException } from '../exception/generic-error.exception';
import { ConnectionErrorException } from '../exception/connection-error.exception';
import { InvalidTokenException } from '../exception/invalid-token.exception';
import { UserNotInRoomException } from '../exception/user-not-in-room.exception';
import { UserNotMasterException } from '../exception/user-not-master.exception';

// Messages.
import { PongMessage } from '../message/pong.message';
import { GetRoomResponse } from '../message/get-room.response';
import { GetRoomsResponse } from '../message/get-rooms.response';
import { CreateRoomResponse } from '../message/create-room.response';
import { JoinRoomResponse } from '../message/join-room.response';
import { LeaveRoomResponse } from '../message/leave-room.response';
import { KickUserResponse } from '../message/kick-user.response';
import { SendTextResponse } from '../message/send-text.response';

@WebSocketGateway()
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new WsExceptionFilter())
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect
{
    private readonly logger = new Logger('LOBBY');

    constructor(
        private readonly authService: AuthService,
        private readonly sessionService: SessionService,
        private readonly userService: UserService,
        private readonly roomService: RoomService,
        private readonly notificationService: NotificationService
    ) { }

    async handleConnection( socket: WebSocket, ...args: any[] )
    {
        // Authenticate the connection using the token URL parameter.
        const params = new URLSearchParams(args[0].url.replace('/','').replace('?', ''));
        const token = params.get('token');

        try
        {
            // Verify the token.
            const payload = this.authService.verify(token);
            if( !payload || !('username' in payload) )
            {
                this.logger.log(`CONNECTION FAILURE token:${token}`);

                let exception = new InvalidTokenException();
                socket.send(JSON.stringify(exception.getError()));
                socket.close();
    
                return;
            }

            // Create the session.
            let session = this.sessionService.create(payload.username, socket);
            if( !session )
            {
                this.logger.log(`CONNECTION FAILURE token:${token}`);

                let exception = new ConnectionErrorException("User already connected");
                socket.send(JSON.stringify(exception.getError()));
                socket.close();

                return;
            }

            this.logger.log(`CONNECTED ${payload.username} payload:${JSON.stringify(payload)}`);

            // User online.
            this.notificationService.sendUserOnline(payload.username);

            // User rejoining.
            try
            {
                let user = await this.userService.getByUsername(payload.username);
                let room = await this.roomService.getByName(user.room.name);
                this.notificationService.sendUserRejoined(user, room);
            }
            catch( exception ) { }
        }
        catch( exception )
        {
            this.logger.log(`CONNECTION FAILURE token:${token}`);

            exception = new ConnectionErrorException(exception.message);
            socket.send(JSON.stringify(exception.getError()));
            socket.close();

            return;
        }
    }

    async handleDisconnect( socket: WebSocket )
    {
        this.logger.log(`DISCONNECTED ${socket.username}`);

        // Delete the session.
        this.sessionService.delete(socket.username);

        // User offline.
        this.notificationService.sendUserOffline(socket.username);
    }

    @SubscribeMessage('ping')
    @UseInterceptors(new ValidationInterceptor(PingSchema), AuthInterceptor, new UuidInterceptor())
    ping(
        @ConnectedSocket() socket: WebSocket,
        @MessageBody('username') username: string
    ): any
    {
        //this.logger.log(`PING username:${username}`);

        return new PongMessage();
    }

    @SubscribeMessage('get_room')
    @UseInterceptors(new ValidationInterceptor(GetRoomSchema), AuthInterceptor, new UuidInterceptor())
    async getRoom(
        @ConnectedSocket() socket: WebSocket,
        @MessageBody('username') username: string
    ): Promise<any>
    {
        this.logger.log(`GET_ROOM username:${username}`);

        try
        {
            const user = await this.userService.getByUsername(username);
            const room = await this.roomService.getByName(user.room.name);

            return new GetRoomResponse({ room });
        }
        catch( exception )
        {
            return new GetRoomResponse();
        }
    }

    @SubscribeMessage('get_rooms')
    @UseInterceptors(new ValidationInterceptor(GetRoomsSchema), AuthInterceptor, new UuidInterceptor())
    async getRooms(
        @ConnectedSocket() socket: WebSocket
    ): Promise<any>
    {
        this.logger.log(`GET_ROOMS`);

        try
        {
            const rooms = await this.roomService.getAll(true);

            return new GetRoomsResponse({ rooms });
        }
        catch( exception )
        {
            return new GetRoomsResponse();
        }
    }

    @SubscribeMessage('create_room')
    @UseInterceptors(new ValidationInterceptor(CreateRoomSchema), AuthInterceptor, new UuidInterceptor())
    async createRoom(
        @ConnectedSocket() socket: WebSocket,
        @MessageBody('username') username: string,
        @MessageBody('name') name: string,
        @MessageBody('password') password: string,
        @MessageBody('hidden') hidden: boolean,
        @MessageBody('size') size: number,
        @MessageBody('icon') icon: string
    ): Promise<any>
    {
        this.logger.log(`CREATE_ROOM username:${username} name:${name} password:${password} hidden:${hidden} size:${size} icon:${icon}`);

        const room = await this.roomService.create(username, name, password, hidden, Number(size), icon);

        this.notificationService.sendRoomCreated(room);

        return new CreateRoomResponse({ room });
    }

    @SubscribeMessage('join_room')
    @UseInterceptors(new ValidationInterceptor(JoinRoomSchema), AuthInterceptor, new UuidInterceptor())
    async joinRoom(
        @ConnectedSocket() socket: WebSocket,
        @MessageBody('username') username: string,
        @MessageBody('name') name: string,
        @MessageBody('password') password: string
    ): Promise<any>
    {
        this.logger.log(`JOIN_ROOM username:${username} name:${name} password:${password}`);

        const room = await this.roomService.join(username, name, password);
        const user = await this.userService.getByUsername(username);

        this.notificationService.sendGuestJoinedRoom(user, room);

        return new JoinRoomResponse({ room });
    }

    @SubscribeMessage('leave_room')
    @UseInterceptors(new ValidationInterceptor(LeaveRoomSchema), AuthInterceptor, new UuidInterceptor())
    async leaveRoom(
        @ConnectedSocket() socket: WebSocket,
        @MessageBody('username') username: string
    ): Promise<any>
    {
        this.logger.log(`LEAVE_ROOM username:${username}`);

        let user;
        let isMaster = false;
        try
        {
            user = await this.userService.getByUsername(username);
            let room = await this.roomService.getByName(user.room.name);
            isMaster = (room.master.id == user.id);
        }
        catch( exception )
        {
        }

        const room = await this.roomService.leave(username);
        if( isMaster )
        {
            this.notificationService.sendRoomDeleted(room);
        }
        else
        {
            this.notificationService.sendGuestLeftRoom(user, room);
        }

        return new LeaveRoomResponse({ room });
    }

    @SubscribeMessage('kick_user')
    @UseInterceptors(new ValidationInterceptor(KickUserSchema), AuthInterceptor, new UuidInterceptor())
    async kickUser(
        @ConnectedSocket() socket: WebSocket,
        @MessageBody('username') username: string,
        @MessageBody('target') target: string
    ): Promise<any>
    {
        this.logger.log(`KICK_USER username:${username} target:${target}`);

        let user;
        let room;
        let isMaster = false;
        try
        {
            user = await this.userService.getByUsername(username);
            room = await this.roomService.getByName(user.room.name);
            isMaster = (room.master.id == user.id);
        }
        catch( exception )
        {
            // User not found catched.
            throw new UserNotInRoomException(username);
        }
        if( !isMaster )
        {
            throw new UserNotMasterException(username);
        }
        if( username == target )
        {
            throw new GenericErrorException('Master cannot kick itself');
        }

        let userToKick;
        try
        {
            userToKick = await this.userService.getByUsername(target);
            await this.roomService.getByName(userToKick.room.name);
        }
        catch( exception )
        {
            // User not found catched.
            throw new UserNotInRoomException(target);
        }

        userToKick = await this.userService.delete(target);
        room = await this.roomService.getByName(user.room.name);

        this.notificationService.sendUserKicked(userToKick, room);

        return new KickUserResponse({ room });
    }

    @SubscribeMessage('send_text')
    @UseInterceptors(new ValidationInterceptor(SendTextSchema), AuthInterceptor, new UuidInterceptor())
    async sendText(
        @ConnectedSocket() socket: WebSocket,
        @MessageBody('username') username: string,
        @MessageBody('text') text: string
    ): Promise<any>
    {
        this.logger.log(`SEND_TEXT username:${username}`);

        let user;
        try
        {
            user = await this.userService.getByUsername(username);
        }
        catch( exception )
        {
            // User not found catched.
            throw new UserNotInRoomException(username);
        }

        let room = await this.roomService.getByName(user.room.name);
        if( room )
        {
            this.notificationService.sendChatText(user, room, text);
        }

        return new SendTextResponse();
    }
}
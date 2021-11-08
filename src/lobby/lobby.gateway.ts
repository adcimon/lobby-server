import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { WebSocket } from 'ws';
import { Logger, UseFilters, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';

import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { RoomService } from '../room/room.service';
import { SessionService } from '../session/session.service';
import { NotificationService } from './notification.service';

import { ValidationInterceptor } from '../validation/validation.interceptor';
import { AuthInterceptor } from '../auth/auth.interceptor';
import { UuidInterceptor } from '../validation/uuid.interceptor';
import { PingSchema, GetRoomSchema, GetRoomsSchema, CreateRoomSchema, JoinRoomSchema, LeaveRoomSchema } from '../validation/validation.schema';
import { WsExceptionFilter } from '../exception/ws-exception.filter';
import { InvalidTokenException } from '../exception/invalid-token.exception';

import { PongMessage } from '../message/pong.message';
import { GetRoomResponse } from '../message/get-room.response';
import { GetRoomsResponse } from '../message/get-rooms.response';
import { CreateRoomResponse } from '../message/create-room.response';
import { JoinRoomResponse } from '../message/join-room.response';
import { LeaveRoomResponse } from '../message/leave-room.response';

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
        private readonly sessionService: SessionService,
        private readonly notificationService: NotificationService
    ) { }

    async handleConnection( socket: WebSocket, ...args: any[] )
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

            this.logger.log('CONNECTED ' + payload.username + ' payload:' + JSON.stringify(payload));

            // Create the session.
            this.sessionService.create(payload.username, socket);

            // User online.
            this.notificationService.userOnline(payload.username);

            // User rejoining.
            try
            {
                let user = await this.userService.getByUsername(payload.username);
                let room = await this.roomService.getByName(user.room.name);
                this.notificationService.userRejoined(user, room);
            }
            catch( exception ) { }
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

    async handleDisconnect( socket: WebSocket )
    {
        this.logger.log('DISCONNECTED ' + socket.username);

        // Delete the session.
        this.sessionService.delete(socket.username);

        // User offline.
        this.notificationService.userOffline(socket.username);
    }

    @SubscribeMessage('ping')
    @UseInterceptors(new ValidationInterceptor(PingSchema), AuthInterceptor, new UuidInterceptor())
    ping(
        @ConnectedSocket() socket: WebSocket,
        @MessageBody('username') username: string
    ): any
    {
        //this.logger.log('PING' + ' username:' + username);

        return new PongMessage();
    }

    @SubscribeMessage('get_room')
    @UseInterceptors(new ValidationInterceptor(GetRoomSchema), AuthInterceptor, new UuidInterceptor())
    async getRoom(
        @ConnectedSocket() socket: WebSocket,
        @MessageBody('username') username: string
    ): Promise<any>
    {
        this.logger.log('GET_ROOM' + ' username:' + username);

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
        this.logger.log('GET_ROOMS');

        try
        {
            const rooms = await this.roomService.getAll();

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
        @MessageBody('icon') icon: string
    ): Promise<any>
    {
        this.logger.log('CREATE_ROOM' + ' username:' + username + ' name:' + name + ' password:' + password + ' icon:' + icon);

        const room = await this.roomService.create(username, name, password, icon);

        this.notificationService.roomCreated(room);

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
        this.logger.log('JOIN_ROOM' + ' username:' + username + ' name:' + name + ' password:' + password);

        const room = await this.roomService.join(username, name, password);
        const user = await this.userService.getByUsername(username);

        this.notificationService.guestJoinedRoom(user, room);

        return new JoinRoomResponse({ room });
    }

    @SubscribeMessage('leave_room')
    @UseInterceptors(new ValidationInterceptor(LeaveRoomSchema), AuthInterceptor, new UuidInterceptor())
    async leaveRoom(
        @ConnectedSocket() socket: WebSocket,
        @MessageBody('username') username: string
    ): Promise<any>
    {
        this.logger.log('LEAVE_ROOM' + ' username:' + username);

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
            this.notificationService.roomDeleted(room);
        }
        else
        {
            this.notificationService.guestLeftRoom(user, room);
        }

        return new LeaveRoomResponse();
    }
}
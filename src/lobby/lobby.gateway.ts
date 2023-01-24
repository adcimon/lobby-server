import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { WebSocket } from 'ws';
import { Logger, UseFilters, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';

// Entities.
import { Session } from '../sessions/session';
import { User } from '../users/user.entity';
import { Room } from '../rooms/room.entity';

// Providers.
import { AuthService } from '../auth/auth.service';
import { SessionsService } from '../sessions/sessions.service';
import { UsersService } from '../users/users.service';
import { RoomsService } from '../rooms/rooms.service';
import { NotificationService } from './notification.service';

// Validation.
import { ValidationInterceptor } from '../validation/validation.interceptor';
import { AuthInterceptor } from '../auth/auth.interceptor';
import { UuidInterceptor } from '../validation/uuid.interceptor';
import { ValidationSchema } from '../validation/validation.schema';

// Exceptions.
import { WsExceptionFilter } from '../exceptions/ws-exception.filter';
import { GenericErrorException } from '../exceptions/generic-error.exception';
import { ConnectionErrorException } from '../exceptions/connection-error.exception';
import { InvalidTokenException } from '../exceptions/invalid-token.exception';
import { UserNotInRoomException } from '../exceptions/user-not-in-room.exception';
import { UserNotMasterException } from '../exceptions/user-not-master.exception';

// Messages.
import { ClientAuthorizedMessage } from '../messages/client-authorized.message';
import { PongMessage } from '../messages/pong.message';
import { GetRoomResponse } from '../messages/get-room.response';
import { GetRoomsResponse } from '../messages/get-rooms.response';
import { CreateRoomResponse } from '../messages/create-room.response';
import { JoinRoomResponse } from '../messages/join-room.response';
import { LeaveRoomResponse } from '../messages/leave-room.response';
import { KickUserResponse } from '../messages/kick-user.response';
import { SendTextResponse } from '../messages/send-text.response';

@WebSocketGateway()
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new WsExceptionFilter())
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect
{
	private readonly logger: Logger = new Logger('LOBBY');

	constructor(
		private readonly authService: AuthService,
		private readonly sessionService: SessionsService,
		private readonly userService: UsersService,
		private readonly roomService: RoomsService,
		private readonly notificationService: NotificationService
	) { }

	async handleConnection( socket: WebSocket, ...args: any[] )
	{
		// Authenticate the connection using the token URL parameter.
		const params: URLSearchParams = new URLSearchParams(args[0].url.replace('/','').replace('?', ''));
		const token: string = params.get('token');

		// Verify the token.
		let payload: any = null;
		try
		{
			payload = this.authService.verify(token);
			if( !payload || !('sub' in payload) )
			{
				this.logger.log(`CONNECTION FAILURE token:${token}`);

				const exception = new InvalidTokenException();
				const errorMessage: string = JSON.stringify(exception.getError());
				socket.send(errorMessage);
				socket.terminate();

				return;
			}
		}
		catch( exception: any )
		{
			this.logger.log(`CONNECTION FAILURE token:${token}`);

			const errorMessage: string = JSON.stringify(exception.getError());
			socket.send(errorMessage);
			socket.terminate();

			return;
		}

		// Create the session.
		let session: Session = this.sessionService.create(payload.sub, socket);
		if( !session )
		{
			this.logger.log(`CONNECTION FAILURE token:${token}`);

			const exception: ConnectionErrorException = new ConnectionErrorException('User already connected');
			const errorMessage: string = JSON.stringify(exception.getError());
			socket.send(errorMessage);
			socket.terminate();

			return;
		}

		this.logger.log(`CONNECTED ${payload.sub} payload:${JSON.stringify(payload)}`);

		const message: ClientAuthorizedMessage = new ClientAuthorizedMessage();
		socket.send(JSON.stringify(message));

		// User online.
		this.notificationService.sendUserOnline(payload.sub);

		// User rejoining.
		try
		{
			let user: User = await this.userService.getByUsername(payload.sub);
			let room: Room = await this.roomService.getByName(user.room.name);
			this.notificationService.sendUserRejoined(user, room);
		}
		catch( exception: any )
		{
			// Ignore rejoin exceptions.
		}
	}

	async handleDisconnect( socket: WebSocket )
	{
		this.logger.log(`DISCONNECTED ${socket.username}`);

		// Delete the session.
		this.sessionService.delete(socket.username);

		// User offline.
		if( socket.username )
		{
			this.notificationService.sendUserOffline(socket.username);
		}
	}

	@SubscribeMessage('ping')
	@UseInterceptors(new ValidationInterceptor(ValidationSchema.PingSchema), AuthInterceptor, new UuidInterceptor())
	ping(
		@ConnectedSocket() socket: WebSocket,
		@MessageBody('username') username: string
	): any
	{
		//this.logger.log(`PING username:${username}`);

		return new PongMessage();
	}

	@SubscribeMessage('get_room')
	@UseInterceptors(new ValidationInterceptor(ValidationSchema.GetRoomSchema), AuthInterceptor, new UuidInterceptor())
	async getRoom(
		@ConnectedSocket() socket: WebSocket,
		@MessageBody('username') username: string
	): Promise<any>
	{
		this.logger.log(`GET_ROOM username:${username}`);

		try
		{
			const user: User = await this.userService.getByUsername(username);
			const room: Room = await this.roomService.getByName(user.room.name);

			return new GetRoomResponse({ room });
		}
		catch( exception: any )
		{
			return new GetRoomResponse();
		}
	}

	@SubscribeMessage('get_rooms')
	@UseInterceptors(new ValidationInterceptor(ValidationSchema.GetRoomsSchema), AuthInterceptor, new UuidInterceptor())
	async getRooms(
		@ConnectedSocket() socket: WebSocket
	): Promise<any>
	{
		this.logger.log(`GET_ROOMS`);

		try
		{
			const rooms: Room[] = await this.roomService.getAll(true);

			return new GetRoomsResponse({ rooms });
		}
		catch( exception: any )
		{
			return new GetRoomsResponse();
		}
	}

	@SubscribeMessage('create_room')
	@UseInterceptors(new ValidationInterceptor(ValidationSchema.CreateRoomSchema), AuthInterceptor, new UuidInterceptor())
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

		const room: Room = await this.roomService.create(username, name, password, hidden, Number(size), icon);

		this.notificationService.sendRoomCreated(room);

		return new CreateRoomResponse({ room });
	}

	@SubscribeMessage('join_room')
	@UseInterceptors(new ValidationInterceptor(ValidationSchema.JoinRoomSchema), AuthInterceptor, new UuidInterceptor())
	async joinRoom(
		@ConnectedSocket() socket: WebSocket,
		@MessageBody('username') username: string,
		@MessageBody('name') name: string,
		@MessageBody('password') password: string
	): Promise<any>
	{
		this.logger.log(`JOIN_ROOM username:${username} name:${name} password:${password}`);

		const room: Room = await this.roomService.join(username, name, password);
		const user: User = await this.userService.getByUsername(username);

		this.notificationService.sendGuestJoinedRoom(user, room);

		return new JoinRoomResponse({ room });
	}

	@SubscribeMessage('leave_room')
	@UseInterceptors(new ValidationInterceptor(ValidationSchema.LeaveRoomSchema), AuthInterceptor, new UuidInterceptor())
	async leaveRoom(
		@ConnectedSocket() socket: WebSocket,
		@MessageBody('username') username: string
	): Promise<any>
	{
		this.logger.log(`LEAVE_ROOM username:${username}`);

		let user: User;
		let isMaster: boolean = false;
		try
		{
			user = await this.userService.getByUsername(username);
			let room: Room = await this.roomService.getByName(user.room.name);
			isMaster = (room.master.id == user.id);
		}
		catch( exception: any )
		{
		}

		const room: Room = await this.roomService.leave(username);
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
	@UseInterceptors(new ValidationInterceptor(ValidationSchema.KickUserSchema), AuthInterceptor, new UuidInterceptor())
	async kickUser(
		@ConnectedSocket() socket: WebSocket,
		@MessageBody('username') username: string,
		@MessageBody('target') target: string
	): Promise<any>
	{
		this.logger.log(`KICK_USER username:${username} target:${target}`);

		let user: User;
		let room: Room;
		let isMaster: boolean = false;
		try
		{
			user = await this.userService.getByUsername(username);
			room = await this.roomService.getByName(user.room.name);
			isMaster = (room.master.id == user.id);
		}
		catch( exception: any )
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

		let userToKick: User;
		try
		{
			userToKick = await this.userService.getByUsername(target);
			await this.roomService.getByName(userToKick.room.name);
		}
		catch( exception: any )
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
	@UseInterceptors(new ValidationInterceptor(ValidationSchema.SendTextSchema), AuthInterceptor, new UuidInterceptor())
	async sendText(
		@ConnectedSocket() socket: WebSocket,
		@MessageBody('username') username: string,
		@MessageBody('text') text: string
	): Promise<any>
	{
		this.logger.log(`SEND_TEXT username:${username}`);

		let user: User;
		try
		{
			user = await this.userService.getByUsername(username);
		}
		catch( exception: any )
		{
			// User not found catched.
			throw new UserNotInRoomException(username);
		}

		let room: Room = await this.roomService.getByName(user.room.name);
		if( room )
		{
			this.notificationService.sendChatText(user, room, text);
		}

		return new SendTextResponse();
	}
}
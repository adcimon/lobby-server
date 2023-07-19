import {
	WebSocketGateway,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	ConnectedSocket,
	MessageBody,
} from '@nestjs/websockets';
import { Logger, UseFilters, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { WebSocket } from 'ws';

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

// Messages.
import { ClientAuthorizedMessage } from '../messages/client-authorized.message';
import { PongMessage } from '../messages/pong.message';
import { GetRoomResponse } from '../messages/get-room.response';
import { GetRoomsResponse } from '../messages/get-rooms.response';
import { CreateRoomResponse } from '../messages/create-room.response';
import { JoinRoomResponse } from '../messages/join-room.response';
import { LeaveRoomResponse } from '../messages/leave-room.response';
import { KickUserResponse } from '../messages/kick-user.response';

// Exceptions.
import { WsExceptionFilter } from '../exceptions/ws-exception.filter';
import { GenericErrorException } from '../exceptions/generic-error.exception';
import { ConnectionErrorException } from '../exceptions/connection-error.exception';
import { InvalidTokenException } from '../exceptions/invalid-token.exception';
import { UserNotInRoomException } from '../exceptions/user-not-in-room.exception';
import { UserNotMasterException } from '../exceptions/user-not-master.exception';

const WHITE_COLOR: string = '\x1b[0m';
const RED_COLOR: string = '\x1b[31m';
const GREEN_COLOR: string = '\x1b[32m';
const YELLOW_COLOR: string = '\x1b[33m';
const CYAN_COLOR: string = '\x1b[36m';
const BASE_COLOR: string = WHITE_COLOR;

const CONNECTING_TAG: string = `${YELLOW_COLOR}CONNECTING${BASE_COLOR}`;
const CONNECTED_TAG: string = `${GREEN_COLOR}CONNECTED${BASE_COLOR}`;
const DISCONNECTED_TAG: string = `${RED_COLOR}DISCONNECTED${BASE_COLOR}`;
const MESSAGE_TAG = (tag: string): string => {
	return `${CYAN_COLOR}${tag}${BASE_COLOR}`;
};
const ERROR_TAG = (tag: string): string => {
	return `${RED_COLOR}${tag}${BASE_COLOR}`;
};

@WebSocketGateway()
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new WsExceptionFilter())
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private readonly logger: Logger = new Logger('LOBBY');

	constructor(
		private readonly authService: AuthService,
		private readonly sessionService: SessionsService,
		private readonly userService: UsersService,
		private readonly roomService: RoomsService,
		private readonly notificationService: NotificationService,
	) {}

	async handleConnection(socket: WebSocket, ...args: any[]) {
		const request: any = args[0];

		// Authenticate the connection using the token URL parameter.
		const params: URLSearchParams = new URLSearchParams(args[0].url.replace('/', '').replace('?', ''));
		const token: string = params.get('token');

		// Decode the token.
		let payload: any = this.authService.decode(token);

		const loginfo: string = ` payload:${JSON.stringify(payload)} ip:${request.socket.remoteAddress}`;
		this.logger.log(CONNECTING_TAG + loginfo);

		// Verify the token.
		try {
			payload = await this.authService.verify(token);
			if (!this.authService.validatePayload(payload)) {
				this.logger.log(ERROR_TAG('INVALID_PAYLOAD') + loginfo);

				const exception: InvalidTokenException = new InvalidTokenException();
				const error: any = exception.getError();
				const msg: string = JSON.stringify(error);
				socket.send(msg);
				socket.terminate();

				return;
			}
		} catch (exception: any) {
			this.logger.log(ERROR_TAG('INVALID_TOKEN') + loginfo);

			const error: any = exception.getError();
			const msg: string = JSON.stringify(error);
			socket.send(msg);
			socket.terminate();

			return;
		}

		// Create the session.
		const username: string = payload.sub;
		const session: Session = this.sessionService.create(socket, username, payload, request.socket.remoteAddress);
		if (!session) {
			this.logger.log(ERROR_TAG('USER_ALREADY_CONNECTED') + loginfo);

			const exception: ConnectionErrorException = new ConnectionErrorException('User already connected');
			const error: any = exception.getError();
			const msg: string = JSON.stringify(error);
			socket.send(msg);
			socket.terminate();

			return;
		}

		this.logger.log(CONNECTED_TAG + ` username:${username}` + loginfo);

		const message: ClientAuthorizedMessage = new ClientAuthorizedMessage();
		const msg: string = JSON.stringify(message);
		socket.send(msg);

		// User online.
		this.notificationService.sendUserOnline(username);

		// User rejoining.
		try {
			let user: User = await this.userService.getByUsername(username);
			let room: Room = await this.roomService.getByName(user.room.name);
			this.notificationService.sendUserRejoined(user, room);
		} catch (exception: any) {
			// Ignore rejoin exceptions.
		}
	}

	async handleDisconnect(socket: WebSocket) {
		const username: any = socket.username;
		const payload: any = JSON.stringify(socket.payload);
		const ip: string = socket.ip;

		const loginfo: string = ` username:${username} payload:${payload} ip:${ip}`;
		this.logger.log(DISCONNECTED_TAG + loginfo);

		// Delete the session.
		this.sessionService.delete(socket.username);

		// User offline.
		if (socket.username) {
			this.notificationService.sendUserOffline(socket.username);
		}
	}

	@SubscribeMessage('ping')
	@UseInterceptors(new ValidationInterceptor(ValidationSchema.PingSchema), AuthInterceptor, new UuidInterceptor())
	ping(@ConnectedSocket() socket: WebSocket, @MessageBody('username') username: string): any {
		//this.logger.log(MESSAGE_TAG('PING') + ` username:${username}`);

		return new PongMessage();
	}

	@SubscribeMessage('get_room')
	@UseInterceptors(new ValidationInterceptor(ValidationSchema.GetRoomSchema), AuthInterceptor, new UuidInterceptor())
	async getRoom(@ConnectedSocket() socket: WebSocket, @MessageBody('username') username: string): Promise<any> {
		this.logger.log(MESSAGE_TAG('GET_ROOM') + ` username:${username}`);

		try {
			const user: User = await this.userService.getByUsername(username);
			const room: Room = await this.roomService.getByName(user.room.name);

			return new GetRoomResponse({ room });
		} catch (exception: any) {
			return new GetRoomResponse();
		}
	}

	@SubscribeMessage('get_rooms')
	@UseInterceptors(new ValidationInterceptor(ValidationSchema.GetRoomsSchema), AuthInterceptor, new UuidInterceptor())
	async getRooms(@ConnectedSocket() socket: WebSocket): Promise<any> {
		this.logger.log(MESSAGE_TAG('GET_ROOMS'));

		try {
			const rooms: Room[] = await this.roomService.getAll(true);

			return new GetRoomsResponse({ rooms });
		} catch (exception: any) {
			return new GetRoomsResponse();
		}
	}

	@SubscribeMessage('create_room')
	@UseInterceptors(
		new ValidationInterceptor(ValidationSchema.CreateRoomSchema),
		AuthInterceptor,
		new UuidInterceptor(),
	)
	async createRoom(
		@ConnectedSocket() socket: WebSocket,
		@MessageBody('username') username: string,
		@MessageBody('name') name: string,
		@MessageBody('password') password: string,
		@MessageBody('hidden') hidden: boolean,
		@MessageBody('size') size: number,
		@MessageBody('icon') icon: string,
	): Promise<any> {
		this.logger.log(
			MESSAGE_TAG('CREATE_ROOM') +
				` username:${username} name:${name} password:${password} hidden:${hidden} size:${size} icon:${icon}`,
		);

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
		@MessageBody('password') password: string,
	): Promise<any> {
		this.logger.log(MESSAGE_TAG('JOIN_ROOM') + ` username:${username} name:${name} password:${password}`);

		const room: Room = await this.roomService.join(username, name, password);
		const user: User = await this.userService.getByUsername(username);

		this.notificationService.sendGuestJoinedRoom(user, room);

		return new JoinRoomResponse({ room });
	}

	@SubscribeMessage('leave_room')
	@UseInterceptors(
		new ValidationInterceptor(ValidationSchema.LeaveRoomSchema),
		AuthInterceptor,
		new UuidInterceptor(),
	)
	async leaveRoom(@ConnectedSocket() socket: WebSocket, @MessageBody('username') username: string): Promise<any> {
		this.logger.log(MESSAGE_TAG('LEAVE_ROOM') + ` username:${username}`);

		let user: User;
		let isMaster: boolean = false;
		try {
			user = await this.userService.getByUsername(username);
			let room: Room = await this.roomService.getByName(user.room.name);
			isMaster = room.master.id === user.id;
		} catch (exception: any) {}

		const room: Room = await this.roomService.leave(username);
		if (isMaster) {
			this.notificationService.sendRoomDeleted(room);
		} else {
			this.notificationService.sendGuestLeftRoom(user, room);
		}

		return new LeaveRoomResponse({ room });
	}

	@SubscribeMessage('kick_user')
	@UseInterceptors(new ValidationInterceptor(ValidationSchema.KickUserSchema), AuthInterceptor, new UuidInterceptor())
	async kickUser(
		@ConnectedSocket() socket: WebSocket,
		@MessageBody('username') username: string,
		@MessageBody('target') target: string,
	): Promise<any> {
		this.logger.log(MESSAGE_TAG('KICK_USER') + ` target:${target}`);

		let user: User;
		let room: Room;
		let isMaster: boolean = false;
		try {
			user = await this.userService.getByUsername(username);
			room = await this.roomService.getByName(user.room.name);
			isMaster = room.master.id === user.id;
		} catch (exception: any) {
			// User not found catched.
			throw new UserNotInRoomException(username);
		}
		if (!isMaster) {
			throw new UserNotMasterException(username);
		}
		if (username === target) {
			throw new GenericErrorException('Master cannot kick itself');
		}

		let userToKick: User;
		try {
			userToKick = await this.userService.getByUsername(target);
			await this.roomService.getByName(userToKick.room.name);
		} catch (exception: any) {
			// User not found catched.
			throw new UserNotInRoomException(target);
		}

		userToKick = await this.userService.delete(target);
		room = await this.roomService.getByName(user.room.name);

		this.notificationService.sendUserKicked(userToKick, room);

		return new KickUserResponse({ room });
	}
}

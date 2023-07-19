import { WsResponse } from '@nestjs/websockets';
import { User } from '../users/user.entity';
import { Room } from '../rooms/room.entity';

export class UserRejoinedMessage implements WsResponse {
	event: string;
	data: any;

	constructor(user: User, room: Room) {
		this.event = 'user_rejoined';
		this.data = {
			user: user,
			room: room,
		};
	}
}

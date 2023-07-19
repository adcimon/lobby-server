import { WsResponse } from '@nestjs/websockets';
import { Room } from '../rooms/room.entity';

export class RoomCreatedMessage implements WsResponse {
	event: string;
	data: any;

	constructor(room: Room) {
		this.event = 'room_created';
		this.data = {
			room: room,
		};
	}
}

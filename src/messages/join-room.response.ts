import { WsResponse } from '@nestjs/websockets';

export class JoinRoomResponse implements WsResponse {
	event: string;
	data: any;

	constructor(data?: any) {
		this.event = 'join_room_response';
		this.data = data || {};
	}
}

import { WsResponse } from '@nestjs/websockets';

export class GetRoomResponse implements WsResponse {
	event: string;
	data: any;

	constructor(data?: any) {
		this.event = 'get_room_response';
		this.data = data || {};
	}
}

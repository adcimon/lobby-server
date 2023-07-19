import { WsResponse } from '@nestjs/websockets';

export class GetRoomsResponse implements WsResponse {
	event: string;
	data: any;

	constructor(data?: any) {
		this.event = 'get_rooms_response';
		this.data = data || {};
	}
}

import { WsResponse } from '@nestjs/websockets';

export class LeaveRoomResponse implements WsResponse {
	event: string;
	data: any;

	constructor(data?: any) {
		this.event = 'leave_room_response';
		this.data = data || {};
	}
}

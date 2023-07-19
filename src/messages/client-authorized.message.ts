import { WsResponse } from '@nestjs/websockets';

export class ClientAuthorizedMessage implements WsResponse {
	event: string;
	data: any;

	constructor() {
		this.event = 'client_authorized';
		this.data = {};
	}
}

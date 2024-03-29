import { WsException } from '@nestjs/websockets';

export class RoomNotFoundException extends WsException {
	constructor(name: string) {
		super({
			event: 'error',
			data: {
				code: 'room_not_found',
				message: 'Room not found',
				name: name,
			},
		});
	}
}

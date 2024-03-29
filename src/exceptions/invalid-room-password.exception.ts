import { WsException } from '@nestjs/websockets';

export class InvalidRoomPasswordException extends WsException {
	constructor(name: string) {
		super({
			event: 'error',
			data: {
				code: 'invalid_room_password',
				message: 'Invalid room password',
				name: name,
			},
		});
	}
}

import { WsException } from '@nestjs/websockets';

export class RoomAlreadyExistsException extends WsException {
	constructor(name: string) {
		super({
			event: 'error',
			data: {
				code: 'room_already_exists',
				message: 'Room already exists',
				name: name,
			},
		});
	}
}

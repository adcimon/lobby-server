import { WsException } from '@nestjs/websockets';

export class UserAlreadyInRoomException extends WsException {
	constructor(username: string, name: string) {
		super({
			event: 'error',
			data: {
				code: 'user_already_in_room',
				message: 'User already in room',
				username: username,
				name: name,
			},
		});
	}
}

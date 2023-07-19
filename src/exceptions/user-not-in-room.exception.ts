import { WsException } from '@nestjs/websockets';

export class UserNotInRoomException extends WsException {
	constructor(username: string) {
		super({
			event: 'error',
			data: {
				code: 'user_not_in_room',
				message: 'User not in room',
				username: username,
			},
		});
	}
}

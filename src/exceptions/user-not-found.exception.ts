import { WsException } from '@nestjs/websockets';

export class UserNotFoundException extends WsException {
	constructor(username: string) {
		super({
			event: 'error',
			data: {
				code: 'user_not_found',
				message: 'User not found',
				username: username,
			},
		});
	}
}

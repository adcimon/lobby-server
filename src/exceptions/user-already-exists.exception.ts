import { WsException } from '@nestjs/websockets';

export class UserAlreadyExistsException extends WsException {
	constructor(username: string) {
		super({
			event: 'error',
			data: {
				code: 'user_already_exists',
				message: 'User already exists',
				username: username,
			},
		});
	}
}

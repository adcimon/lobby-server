import { WsException } from '@nestjs/websockets';

export class UserNotMasterException extends WsException {
	constructor(username: string) {
		super({
			event: 'error',
			data: {
				code: 'user_not_master',
				message: 'User is not master',
				username: username,
			},
		});
	}
}

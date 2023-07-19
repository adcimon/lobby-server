import { WsException } from '@nestjs/websockets';

export class InvalidTokenException extends WsException {
	constructor() {
		super({
			event: 'error',
			data: {
				code: 'invalid_token',
				message: 'Invalid token',
			},
		});
	}
}

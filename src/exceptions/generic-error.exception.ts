import { WsException } from '@nestjs/websockets';

export class GenericErrorException extends WsException {
	constructor(message?: string) {
		super({
			event: 'error',
			data: {
				code: 'generic_error',
				message: message || 'Generic error',
			},
		});
	}
}

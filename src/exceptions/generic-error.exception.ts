import { WsException } from '@nestjs/websockets';

export class GenericErrorException extends WsException {
	constructor(message?: string) {
		super({
			event: 'error',
			data: {
				error: 'generic_error',
				message: message || 'Generic error',
			},
		});
	}
}

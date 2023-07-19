import { WsException } from '@nestjs/websockets';

export class ValidationErrorException extends WsException {
	constructor(message?: string) {
		super({
			event: 'error',
			data: {
				code: 'validation_error',
				message: message || 'Validation error',
			},
		});
	}
}

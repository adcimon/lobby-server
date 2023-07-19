import { WsException } from '@nestjs/websockets';

export class ConnectionErrorException extends WsException {
	constructor(message?: string) {
		super({
			event: 'error',
			data: {
				error: 'connection_error',
				message: message || 'Connection error',
			},
		});
	}
}

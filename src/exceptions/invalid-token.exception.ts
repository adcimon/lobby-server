import { WsException } from '@nestjs/websockets';

export class InvalidTokenException extends WsException
{
	constructor()
	{
		super(
		{
			event: 'error',
			data:
			{
				error: 'invalid_token',
				message: 'Invalid token'
			}
		});
	}
}
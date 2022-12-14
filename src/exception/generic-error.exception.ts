import { WsException } from '@nestjs/websockets';

export class GenericErrorException extends WsException
{
	constructor( message?: string )
	{
		super(
		{
			event: 'error',
			data:
			{
				error: 100,
				message: message || 'Generic error'
			}
		});
	}
}
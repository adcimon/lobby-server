import { WsException } from '@nestjs/websockets';

export class UserNotFoundException extends WsException
{
	constructor( username: string )
	{
		super(
		{
			event: 'error',
			data:
			{
				error: 104,
				message: 'User ' + username + ' not found',
				username: username
			}
		});
	}
}
import { WsException } from '@nestjs/websockets';

export class UserAlreadyExistsException extends WsException
{
	constructor( username: string )
	{
		super(
		{
			event: 'error',
			data:
			{
				error: 'user_already_exists',
				message: 'User ' + username + ' already exists',
				username: username
			}
		});
	}
}
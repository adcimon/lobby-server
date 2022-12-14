import { WsException } from '@nestjs/websockets';

export class UserNotMasterException extends WsException
{
	constructor( username: string )
	{
		super(
		{
			event: 'error',
			data:
			{
				error: 108,
				message: 'User ' + username + ' is not master',
				username: username
			}
		});
	}
}
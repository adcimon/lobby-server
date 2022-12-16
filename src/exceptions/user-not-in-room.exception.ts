import { WsException } from '@nestjs/websockets';

export class UserNotInRoomException extends WsException
{
	constructor( username: string )
	{
		super(
		{
			event: 'error',
			data:
			{
				error: 'user_not_in_room',
				message: 'User ' + username + ' not in room',
				username: username
			}
		});
	}
}
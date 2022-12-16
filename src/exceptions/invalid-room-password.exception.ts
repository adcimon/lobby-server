import { WsException } from '@nestjs/websockets';

export class InvalidRoomPasswordException extends WsException
{
	constructor( name: string )
	{
		super(
		{
			event: 'error',
			data:
			{
				error: 'invalid_room_password',
				message: 'Invalid room ' + name + ' password',
				name: name
			}
		});
	}
}
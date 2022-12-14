import { WsException } from '@nestjs/websockets';

export class RoomFullException extends WsException
{
	constructor( name: string )
	{
		super(
		{
			event: 'error',
			data:
			{
				error: 111,
				message: 'Room ' + name + ' is full',
				name: name
			}
		});
	}
}
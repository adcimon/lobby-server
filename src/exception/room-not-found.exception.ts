import { WsException } from '@nestjs/websockets';

export class RoomNotFoundException extends WsException
{
	constructor( name: string )
	{
		super(
		{
			event: 'error',
			data:
			{
				error: 109,
				message: 'Room ' + name + ' not found',
				name: name
			}
		});
	}
}
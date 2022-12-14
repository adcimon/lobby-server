import { WsException } from '@nestjs/websockets';

export class RoomAlreadyExistsException extends WsException
{
	constructor( name: string )
	{
		super(
		{
			event: 'error',
			data:
			{
				error: 110,
				message: 'Room ' + name + ' already exists',
				name: name
			}
		});
	}
}
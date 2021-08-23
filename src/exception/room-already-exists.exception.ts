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
                error: 108,
                message: 'Room ' + name + ' already exists',
                name: name
            }
        });
    }
}
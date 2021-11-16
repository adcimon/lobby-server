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
                error: 110,
                message: 'Invalid room ' + name + ' password',
                name: name
            }
        });
    }
}
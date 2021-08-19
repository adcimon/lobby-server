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
                error: 107,
                message: 'Invalid room ' + name + ' password',
                name: name
            }
        });
    }
}
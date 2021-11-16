import { WsException } from '@nestjs/websockets';

export class ConnectionErrorException extends WsException
{
    constructor( message?: string )
    {
        super(
        {
            event: 'error',
            data:
            {
                error: 101,
                message: message || 'Connection error'
            }
        });
    }
}
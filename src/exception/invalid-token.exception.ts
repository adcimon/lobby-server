import { WsException } from '@nestjs/websockets';

export class InvalidTokenException extends WsException
{
    constructor()
    {
        super(
        {
            event: 'error',
            data:
            {
                error: 102,
                message: 'Invalid token'
            }
        });
    }
}
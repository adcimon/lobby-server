import { WsException } from '@nestjs/websockets';

export class ValidationErrorException extends WsException
{
    constructor( message?: string )
    {
        super(
        {
            event: 'error',
            data:
            {
                error: 101,
                message: message || 'Validation error'
            }
        });
    }
}
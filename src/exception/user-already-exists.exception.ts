import { WsException } from '@nestjs/websockets';

export class UserAlreadyExistsException extends WsException
{
    constructor( username: string )
    {
        super(
        {
            event: 'error',
            data:
            {
                error: 105,
                message: 'User ' + username + ' already exists',
                username: username
            }
        });
    }
}
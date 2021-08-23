import { WsException } from '@nestjs/websockets';

export class UserAlreadyInRoomException extends WsException
{
    constructor( username: string, name: string )
    {
        super(
        {
            event: 'error',
            data:
            {
                error: 106,
                message: 'User ' + username + ' already in room ' + name,
                username: username,
                name: name
            }
        });
    }
}
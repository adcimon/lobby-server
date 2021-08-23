import { WsException } from '@nestjs/websockets';

export class UserNotInRoomException extends WsException
{
    constructor( username: string )
    {
        super(
        {
            event: 'error',
            data:
            {
                error: 105,
                message: 'User ' + username + ' not in room',
                username: username
            }
        });
    }
}
import { Injectable } from '@nestjs/common';
import { Socket } from 'dgram';

@Injectable()
export class SessionService
{
    private userSessions: Map<string, Socket> = new Map;

    constructor()
    {
    }

    /**
     * Create a session.
     * @param username
     * @param socket
     * @return
     */
    create(
        username: string,
        socket: Socket
    ): any
    {
        this.userSessions.set(username, socket);

        return;
    }

    /**
     * Delete the session.
     * @param username
     * @return
     */
    delete(
        username: string
    ): any
    {
        this.userSessions.delete(username);

        return;
    }
}
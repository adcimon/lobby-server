import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';

@Injectable()
export class SessionService
{
    private sessions: Map<string, WebSocket> = new Map;

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
        socket: WebSocket
    ): any
    {
        socket.username = username;
        this.sessions.set(username, socket);

        return;
    }

    /**
     * Delete the session by username.
     * @param username
     * @return
     */
    deleteByUsername(
        username: string
    ): boolean
    {
        if( !(username in this.sessions) )
        {
            return false;
        }

        this.sessions.delete(username);

        return true;
    }

    /**
     * Delete the session by socket.
     * @param socket
     * @return
     */
    deleteBySocket(
        socket: WebSocket
    ): boolean
    {
        if( !(socket.username in this.sessions) )
        {
            return false;
        }

        this.sessions.delete(socket.username);

        return true;
    }
}
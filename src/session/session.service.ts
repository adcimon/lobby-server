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
     */
    create( username: string, socket: WebSocket )
    {
        socket.username = username;
        this.sessions.set(username, socket);
    }

    /**
     * Get the session's socket.
     * @param username
     * @return WebSocket
     */
    get( username: string ): WebSocket
    {
        if( this.sessions.has(username) )
        {
            return this.sessions.get(username);
        }

        return null;
    }

    /**
     * Get the sessions' usernames.
     * @return string[]
     */
    getUsernames(): string[]
    {
        return Array.from(this.sessions.keys());
    }

    /**
     * Delete the session.
     * @param username
     * @return boolean
     */
    delete( username: string ): boolean
    {
        if( !this.sessions.has(username) )
        {
            return false;
        }

        return this.sessions.delete(username);
    }
}
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
     */
    create( username: string, socket: WebSocket )
    {
        socket.username = username;
        this.sessions.set(username, socket);
    }

    /**
     * Get the session's socket.
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
     */
    getUsernames(): string[]
    {
        return Array.from(this.sessions.keys());
    }

    /**
     * Delete the session.
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
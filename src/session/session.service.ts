import { Injectable } from '@nestjs/common';
import { Session } from './session';
import { WebSocket } from 'ws';

@Injectable()
export class SessionService
{
    private sessions: Map<string, Session> = new Map;

    constructor()
    {
    }

    /**
     * Create a session.
     */
    create( username: string, socket: WebSocket ): Session
    {
        if( this.sessions.has(username) )
        {
            return null;
        }

        socket.username = username;

        let session = new Session();
        session.username = username;
        session.socket = socket;

        this.sessions.set(username, session);

        return session;
    }

    /**
     * Get the user's session.
     */
    get( username: string ): Session
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
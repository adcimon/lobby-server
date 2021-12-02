import { Injectable } from '@nestjs/common';
import { SessionService } from '../session/session.service';
import { User } from '../user/user.entity';
import { Room } from '../room/room.entity';

import { UserOnlineEvent } from '../message/user-online.event';
import { UserOfflineEvent } from '../message/user-offline.event';
import { RoomCreatedEvent } from '../message/room-created.event';
import { RoomDeletedEvent } from '../message/room-deleted.event';
import { GuestJoinedRoomEvent } from '../message/guest-joined-room.event';
import { GuestLeftRoomEvent } from '../message/guest-left-room.event';
import { UserRejoinedEvent } from '../message/user-rejoined.event';
import { UserKickedEvent } from '../message/user-kicked.event';
import { ChatTextEvent } from '../message/chat-text.event';

@Injectable()
export class NotificationService
{
    private readonly NOTIFICATION_DELAY = 100; // ms

    constructor( private readonly sessionService: SessionService )
    {
    }

    /**
     * Broadcast an event to all the sessions.
     */
    private broadcastAll( event: any )
    {
        const self = this;

        function broadcast()
        {
            let usernames = self.sessionService.getUsernames();
            for( let i = 0; i < usernames.length; i++ )
            {
                let username = usernames[i];
                let socket = self.sessionService.get(username);
                socket?.send(JSON.stringify(event));
            }
        }

        if( this.NOTIFICATION_DELAY <= 0 )
        {
            broadcast();
        }
        else
        {
            setTimeout(function()
            {
                broadcast()
            }, this.NOTIFICATION_DELAY);
        }
    }

    /**
     * Broadcast an event to the room sessions.
     */
    private broadcastRoom( event: any, room: Room )
    {
        const self = this;

        function broadcast()
        {
            let usernames = room.users.map(user => user.username);
            for( let i = 0; i < usernames.length; i++ )
            {
                let username = usernames[i];
                let socket = self.sessionService.get(username);
                socket?.send(JSON.stringify(event));
            }
        }

        if( this.NOTIFICATION_DELAY <= 0 )
        {
            broadcast();
        }
        else
        {
            setTimeout(function()
            {
                broadcast()
            }, this.NOTIFICATION_DELAY);
        }
    }

    /**
     * Send a user online event.
     */
    sendUserOnline( username: string )
    {
        let event = new UserOnlineEvent({ username });
        this.broadcastAll(event);
    }

    /**
     * Send a user offline event.
     */
    sendUserOffline( username: string )
    {
        let event = new UserOfflineEvent({ username });
        this.broadcastAll(event);
    }

    /**
     * Send a room created event.
     */
    sendRoomCreated( room: Room )
    {
        delete room.password;
        let event = new RoomCreatedEvent({ room });
        this.broadcastAll(event);
    }

    /**
     * Send a room deleted event.
     */
    sendRoomDeleted( room: Room )
    {
        delete room.password;
        let event = new RoomDeletedEvent({ room });
        this.broadcastAll(event);
    }

    /**
     * Send a guest joined room event.
     */
    sendGuestJoinedRoom( user: User, room: Room )
    {
        delete user.room.password;
        delete room.password;
        let event = new GuestJoinedRoomEvent({ user, room });
        this.broadcastAll(event);
    }

    /**
     * Send a guest left room event.
     */
    sendGuestLeftRoom( user: User, room: Room )
    {
        delete user.room.password;
        delete room.password;
        let event = new GuestLeftRoomEvent({ user, room });
        this.broadcastAll(event);
    }

    /**
     * Send a user rejoined event.
     */
    sendUserRejoined( user: User, room: Room )
    {
        delete user.room.password;
        delete room.password;
        let event = new UserRejoinedEvent({ user, room });
        this.broadcastRoom(event, room);
    }

    /**
     * Send a user kicked event.
     */
    sendUserKicked( user: User, room: Room )
    {
        delete user.room.password;
        delete room.password;
        let event = new UserKickedEvent({ user, room });
        this.broadcastAll(event);
    }

    /**
     * Send a chat text event.
     */
    sendChatText( user: User, room: Room, text: string )
    {
        let event = new ChatTextEvent(
        {
            username: user.username,
            timestamp: new Date(),
            text: text
        });
        this.broadcastRoom(event, room);
    }
}
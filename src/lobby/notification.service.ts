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

@Injectable()
export class NotificationService
{
    private readonly NOTIFICATION_DELAY = 100; // ms

    constructor( private readonly sessionService: SessionService )
    {
    }

    /**
     * Broadcast a message to all the sessions.
     */
    private broadcastAll( message: any )
    {
        const self = this;

        function broadcast()
        {
            let usernames = self.sessionService.getUsernames();
            for( let i = 0; i < usernames.length; i++ )
            {
                let username = usernames[i];
                let socket = self.sessionService.get(username);
                socket?.send(JSON.stringify(message));
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
     * Broadcast a message to the room sessions.
     */
    private broadcastRoom( message: any, room: Room )
    {
        const self = this;

        function broadcast()
        {
            let usernames = room.users.map(user => user.username);
            for( let i = 0; i < usernames.length; i++ )
            {
                let username = usernames[i];
                let socket = self.sessionService.get(username);
                socket?.send(JSON.stringify(message));
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
     * Send the user online event.
     */
    userOnline( username: string )
    {
        let message = new UserOnlineEvent({ username });
        this.broadcastAll(message);
    }

    /**
     * Send the user offline event.
     */
    userOffline( username: string )
    {
        let message = new UserOfflineEvent({ username });
        this.broadcastAll(message);
    }

    /**
     * Send the room created event.
     */
    roomCreated( room: Room )
    {
        delete room.password;
        let message = new RoomCreatedEvent({ room });
        this.broadcastAll(message);
    }

    /**
     * Send a room deleted event.
     */
    roomDeleted( room: Room )
    {
        delete room.password;
        let message = new RoomDeletedEvent({ room });
        this.broadcastAll(message);
    }

    /**
     * Send the guest joined room event.
     */
    guestJoinedRoom( user: User, room: Room )
    {
        delete user.room.password;
        delete room.password;
        let message = new GuestJoinedRoomEvent({ user, room });
        this.broadcastAll(message);
    }

    /**
     * Send a guest left room event.
     */
    guestLeftRoom( user: User, room: Room )
    {
        delete user.room.password;
        delete room.password;
        let message = new GuestLeftRoomEvent({ user, room });
        this.broadcastAll(message);
    }

    /**
     * Send the user rejoined event.
     */
    userRejoined( user: User, room: Room )
    {
        delete user.room.password;
        delete room.password;
        let message = new UserRejoinedEvent({ user, room });
        this.broadcastRoom(message, room);
    }
}
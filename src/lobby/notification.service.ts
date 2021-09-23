import { Injectable } from '@nestjs/common';
import { SessionService } from '../session/session.service';
import { User } from '../user/user.entity';
import { Room } from '../room/room.entity';

import { UserOnlineMessage } from '../message/user-online.message';
import { UserOfflineMessage } from '../message/user-offline.message';
import { RoomCreatedMessage } from '../message/room-created.message';
import { RoomDeletedMessage } from '../message/room-deleted.message';
import { GuestJoinedRoomMessage } from '../message/guest-joined-room.message';
import { GuestLeftRoomMessage } from '../message/guest-left-room.message';
import { UserRejoinedMessage } from '../message/user-rejoined.message';

@Injectable()
export class NotificationService
{
    private readonly NOTIFICATION_DELAY = 100; // ms

    constructor( private readonly sessionService: SessionService )
    {
    }

    /**
     * Broadcast a message to all the sessions.
     * @param message
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
     * @param message
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
     * Send the user online message.
     * @param username
     */
    userOnline( username: string )
    {
        let message = new UserOnlineMessage({ username });
        this.broadcastAll(message);
    }

    /**
     * Send the user offline message.
     * @param username
     */
    userOffline( username: string )
    {
        let message = new UserOfflineMessage({ username });
        this.broadcastAll(message);
    }

    /**
     * Send the room created message.
     * @param room
     */
    roomCreated( room: Room )
    {
        delete room.password;
        let message = new RoomCreatedMessage({ room });
        this.broadcastAll(message);
    }

    /**
     * Send a room deleted message.
     * @param room
     */
    roomDeleted( room: Room )
    {
        delete room.password;
        let message = new RoomDeletedMessage({ room });
        this.broadcastAll(message);
    }

    /**
     * Send the guest joined room message.
     * @param user
     * @param room
     */
    guestJoinedRoom( user: User, room: Room )
    {
        delete user.room.password;
        delete room.password;
        let message = new GuestJoinedRoomMessage({ user, room });
        this.broadcastAll(message);
    }

    /**
     * Send a guest left room message.
     * @param user
     * @param room
     */
    guestLeftRoom( user: User, room: Room )
    {
        delete user.room.password;
        delete room.password;
        let message = new GuestLeftRoomMessage({ user, room });
        this.broadcastAll(message);
    }

    /**
     * Send the user rejoined message.
     * @param user
     * @param room
     */
    userRejoined( user: User, room: Room )
    {
        delete user.room.password;
        delete room.password;
        let message = new UserRejoinedMessage({ user, room });
        this.broadcastRoom(message, room);
    }
}
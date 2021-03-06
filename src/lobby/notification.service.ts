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
import { UserKickedMessage } from '../message/user-kicked.message';
import { ChatTextMessage } from '../message/chat-text.message';

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
                let session = self.sessionService.get(username);
                session?.sendMessage(event);
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
                let session = self.sessionService.get(username);
                session?.sendMessage(event);
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
     * Send a user online message.
     */
    sendUserOnline( username: string )
    {
        let event = new UserOnlineMessage(username);
        this.broadcastAll(event);
    }

    /**
     * Send a user offline message.
     */
    sendUserOffline( username: string )
    {
        let event = new UserOfflineMessage(username);
        this.broadcastAll(event);
    }

    /**
     * Send a room created message.
     */
    sendRoomCreated( room: Room )
    {
        delete room.password;
        let event = new RoomCreatedMessage(room);
        this.broadcastAll(event);
    }

    /**
     * Send a room deleted message.
     */
    sendRoomDeleted( room: Room )
    {
        delete room.password;
        let event = new RoomDeletedMessage(room);
        this.broadcastAll(event);
    }

    /**
     * Send a guest joined room message.
     */
    sendGuestJoinedRoom( user: User, room: Room )
    {
        delete user.room.password;
        delete room.password;
        let event = new GuestJoinedRoomMessage(user, room);
        this.broadcastAll(event);
    }

    /**
     * Send a guest left room message.
     */
    sendGuestLeftRoom( user: User, room: Room )
    {
        delete user.room.password;
        delete room.password;
        let event = new GuestLeftRoomMessage(user, room);
        this.broadcastAll(event);
    }

    /**
     * Send a user rejoined message.
     */
    sendUserRejoined( user: User, room: Room )
    {
        delete user.room.password;
        delete room.password;
        let event = new UserRejoinedMessage(user, room);
        this.broadcastRoom(event, room);
    }

    /**
     * Send a user kicked message.
     */
    sendUserKicked( user: User, room: Room )
    {
        delete user.room.password;
        delete room.password;
        let event = new UserKickedMessage(user, room);
        this.broadcastAll(event);
    }

    /**
     * Send a chat text message.
     */
    sendChatText( user: User, room: Room, text: string )
    {
        let event = new ChatTextMessage(user.username, new Date(), text);
        this.broadcastRoom(event, room);
    }
}
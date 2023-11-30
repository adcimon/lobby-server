import { Injectable } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';

// Entities.
import { Session } from '../sessions/session';
import { User } from '../users/user.entity';
import { Room } from '../rooms/room.entity';

// Messages.
import { UserOnlineMessage } from '../messages/user-online.message';
import { UserOfflineMessage } from '../messages/user-offline.message';
import { RoomCreatedMessage } from '../messages/room-created.message';
import { RoomDeletedMessage } from '../messages/room-deleted.message';
import { GuestJoinedRoomMessage } from '../messages/guest-joined-room.message';
import { GuestLeftRoomMessage } from '../messages/guest-left-room.message';
import { UserRejoinedMessage } from '../messages/user-rejoined.message';
import { UserKickedMessage } from '../messages/user-kicked.message';

@Injectable()
export class NotificationService {
	private readonly NOTIFICATION_DELAY = 100; // ms

	constructor(private readonly sessionService: SessionsService) {}

	/**
	 * Broadcast an event to all the sessions.
	 */
	private broadcastAll(event: any) {
		const self = this;

		function broadcast() {
			let usernames: string[] = self.sessionService.getUsernames();
			for (let i = 0; i < usernames.length; i++) {
				let username: string = usernames[i];
				let session: Session = self.sessionService.get(username);
				session?.sendMessage(event);
			}
		}

		if (this.NOTIFICATION_DELAY <= 0) {
			broadcast();
		} else {
			setTimeout(function () {
				broadcast();
			}, this.NOTIFICATION_DELAY);
		}
	}

	/**
	 * Broadcast an event to the room sessions.
	 */
	private broadcastRoom(event: any, room: Room) {
		const self = this;

		function broadcast() {
			let usernames: string[] = room.users.map((user) => user.username);
			for (let i = 0; i < usernames.length; i++) {
				let username: string = usernames[i];
				let session: Session = self.sessionService.get(username);
				session?.sendMessage(event);
			}
		}

		if (this.NOTIFICATION_DELAY <= 0) {
			broadcast();
		} else {
			setTimeout(function () {
				broadcast();
			}, this.NOTIFICATION_DELAY);
		}
	}

	/**
	 * Send a user online message.
	 */
	public sendUserOnline(username: string) {
		const event: UserOnlineMessage = new UserOnlineMessage(username);
		this.broadcastAll(event);
	}

	/**
	 * Send a user offline message.
	 */
	public sendUserOffline(username: string) {
		const event: UserOfflineMessage = new UserOfflineMessage(username);
		this.broadcastAll(event);
	}

	/**
	 * Send a room created message.
	 */
	public sendRoomCreated(room: Room) {
		delete room.password;
		const event: RoomCreatedMessage = new RoomCreatedMessage(room);
		this.broadcastAll(event);
	}

	/**
	 * Send a room deleted message.
	 */
	public sendRoomDeleted(room: Room) {
		delete room.password;
		const event: RoomDeletedMessage = new RoomDeletedMessage(room);
		this.broadcastAll(event);
	}

	/**
	 * Send a guest joined room message.
	 */
	public sendGuestJoinedRoom(user: User, room: Room) {
		delete user.room.password;
		delete room.password;
		const event: GuestJoinedRoomMessage = new GuestJoinedRoomMessage(user, room);
		this.broadcastAll(event);
	}

	/**
	 * Send a guest left room message.
	 */
	public sendGuestLeftRoom(user: User, room: Room) {
		delete user.room.password;
		delete room.password;
		const event: GuestLeftRoomMessage = new GuestLeftRoomMessage(user, room);
		this.broadcastAll(event);
	}

	/**
	 * Send a user rejoined message.
	 */
	public sendUserRejoined(user: User, room: Room) {
		delete user.room.password;
		delete room.password;
		const event: UserRejoinedMessage = new UserRejoinedMessage(user, room);
		this.broadcastRoom(event, room);
	}

	/**
	 * Send a user kicked message.
	 */
	public sendUserKicked(user: User, room: Room) {
		delete user.room.password;
		delete room.password;
		const event: UserKickedMessage = new UserKickedMessage(user, room);
		this.broadcastAll(event);
	}
}

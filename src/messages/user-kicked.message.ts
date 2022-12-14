import { WsResponse } from "@nestjs/websockets";
import { User } from "../users/user.entity";
import { Room } from "../rooms/room.entity";

export class UserKickedMessage implements WsResponse
{
	event: string;
	data: any;

	constructor( user: User, room: Room )
	{
		this.event = "user_kicked";
		this.data =
		{
			user: user,
			room: room
		};
	}
}
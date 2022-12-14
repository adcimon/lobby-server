import { WsResponse } from "@nestjs/websockets";

export class UserOnlineMessage implements WsResponse
{
	event: string;
	data: any;

	constructor( username: string )
	{
		this.event = "user_online";
		this.data =
		{
			username: username
		};
	}
}
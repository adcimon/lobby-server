import { WsResponse } from "@nestjs/websockets";

export class UserOfflineMessage implements WsResponse
{
	event: string;
	data: any;

	constructor( username: string )
	{
		this.event = "user_offline";
		this.data =
		{
			username: username
		};
	}
}
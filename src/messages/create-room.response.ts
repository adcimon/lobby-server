import { WsResponse } from "@nestjs/websockets";

export class CreateRoomResponse implements WsResponse
{
	event: string;
	data: any;

	constructor( data?: any )
	{
		this.event = "create_room_response";
		this.data = data || { };
	}
}
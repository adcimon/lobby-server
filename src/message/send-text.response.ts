import { WsResponse } from "@nestjs/websockets";

export class SendTextResponse implements WsResponse
{
	event: string;
	data: any;

	constructor( data?: any )
	{
		this.event = "send_text_response";
		this.data = data || { };
	}
}
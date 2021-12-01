import { WsResponse } from "@nestjs/websockets";

export class ChatTextEvent implements WsResponse
{
    event: string;
    data: any;

    constructor( data?: any )
    {
        this.event = "chat_text";
        this.data = data || { };
    }
}
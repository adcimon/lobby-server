import { WsResponse } from "@nestjs/websockets";

export class ChatTextMessage implements WsResponse
{
    event: string;
    data: any;

    constructor( username: string, timestamp: Date, text: string )
    {
        this.event = "chat_text";
        this.data =
        {
            username: username,
            timestamp: timestamp,
            text: text
        };
    }
}
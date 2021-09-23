import { WsResponse } from "@nestjs/websockets";

export class UserOnlineMessage implements WsResponse
{
    event: string;
    data: any;

    constructor( data?: any )
    {
        this.event = "user_online";
        this.data = data || { };
    }
}
import { WsResponse } from "@nestjs/websockets";

export class UserOfflineMessage implements WsResponse
{
    event: string;
    data: any;

    constructor( data?: any )
    {
        this.event = "user_offline";
        this.data = data || { };
    }
}
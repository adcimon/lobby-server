import { WsResponse } from "@nestjs/websockets";

export class UserOfflineEvent implements WsResponse
{
    event: string;
    data: any;

    constructor( data?: any )
    {
        this.event = "user_offline";
        this.data = data || { };
    }
}
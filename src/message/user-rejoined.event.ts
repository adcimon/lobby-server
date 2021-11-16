import { WsResponse } from "@nestjs/websockets";

export class UserRejoinedEvent implements WsResponse
{
    event: string;
    data: any;

    constructor( data?: any )
    {
        this.event = "user_rejoined";
        this.data = data || { };
    }
}
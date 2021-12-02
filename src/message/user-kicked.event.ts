import { WsResponse } from "@nestjs/websockets";

export class UserKickedEvent implements WsResponse
{
    event: string;
    data: any;

    constructor( data?: any )
    {
        this.event = "user_kicked";
        this.data = data || { };
    }
}
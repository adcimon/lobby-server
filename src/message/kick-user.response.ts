import { WsResponse } from "@nestjs/websockets";

export class KickUserResponse implements WsResponse
{
    event: string;
    data: any;

    constructor( data?: any )
    {
        this.event = "kick_user_response";
        this.data = data || { };
    }
}
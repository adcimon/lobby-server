import { WsResponse } from "@nestjs/websockets";

export class PongMessage implements WsResponse
{
    event: string;
    data: any;

    constructor( data?: any )
    {
        this.event = "pong";
        this.data = data || { };
    }
}
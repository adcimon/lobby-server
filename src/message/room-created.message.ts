import { WsResponse } from "@nestjs/websockets";

export class RoomCreatedMessage implements WsResponse
{
    event: string;
    data: any;

    constructor( data?: any )
    {
        this.event = "room_created";
        this.data = data || { };
    }
}
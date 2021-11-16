import { WsResponse } from "@nestjs/websockets";

export class RoomDeletedEvent implements WsResponse
{
    event: string;
    data: any;

    constructor( data?: any )
    {
        this.event = "room_deleted";
        this.data = data || { };
    }
}
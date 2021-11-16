import { WsResponse } from "@nestjs/websockets";

export class GuestLeftRoomEvent implements WsResponse
{
    event: string;
    data: any;

    constructor( data?: any )
    {
        this.event = "guest_left_room";
        this.data = data || { };
    }
}
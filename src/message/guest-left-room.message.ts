import { WsResponse } from "@nestjs/websockets";

export class GuestLeftRoomMessage implements WsResponse
{
    event: string;
    data: any;

    constructor( data?: any )
    {
        this.event = "guest_left_room";
        this.data = data || { };
    }
}
import { WsResponse } from "@nestjs/websockets";

export class GuestJoinedRoomMessage implements WsResponse
{
    event: string;
    data: any;

    constructor( data?: any )
    {
        this.event = "guest_joined_room";
        this.data = data || { };
    }
}
import { WsResponse } from "@nestjs/websockets";
import { Room } from "../room/room.entity";

export class RoomDeletedMessage implements WsResponse
{
    event: string;
    data: any;

    constructor( room: Room )
    {
        this.event = "room_deleted";
        this.data =
        {
            room: room
        };
    }
}
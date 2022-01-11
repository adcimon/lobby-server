import { WsResponse } from "@nestjs/websockets";
import { User } from "../user/user.entity";
import { Room } from "../room/room.entity";

export class GuestLeftRoomMessage implements WsResponse
{
    event: string;
    data: any;

    constructor( user: User, room: Room )
    {
        this.event = "guest_left_room";
        this.data =
        {
            user: user,
            room: room
        };
    }
}
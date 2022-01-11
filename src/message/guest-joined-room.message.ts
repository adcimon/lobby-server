import { WsResponse } from "@nestjs/websockets";
import { User } from "../user/user.entity";
import { Room } from "../room/room.entity";

export class GuestJoinedRoomMessage implements WsResponse
{
    event: string;
    data: any;

    constructor( user: User, room: Room )
    {
        this.event = "guest_joined_room";
        this.data =
        {
            user: user,
            room: room
        };
    }
}
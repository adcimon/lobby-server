import { WsResponse } from "@nestjs/websockets";

export class GenericResponse implements WsResponse
{
    event: string;
    data: any;

    constructor( event: string, data: any )
    {
        this.event = event;
        this.data = data;
    }
}
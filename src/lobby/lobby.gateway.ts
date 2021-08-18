import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Socket } from 'dgram';
import { Server } from 'ws';
import { UseFilters, Logger, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { AuthInterceptor } from '../auth/auth.interceptor';
import { AuthService } from '../auth/auth.service';
import { RoomService } from 'src/room/room.service';
import { WsExceptionFilter } from '../exception/ws-exception.filter';
import { InvalidTokenException } from '../exception/invalid-token.exception';
import { GenericResponse } from '../response/generic.response';
  
@WebSocketGateway()
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new WsExceptionFilter())
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect
{
    private readonly logger = new Logger("LOBBY");

    @WebSocketServer()
    private server: Server;

    private sessions: Map<string, Socket> = new Map;

    constructor(
        private readonly authService: AuthService,
        private readonly roomService: RoomService
    ) { }

    handleConnection( socket: Socket, ...args: any[] )
    {
        const params = new URLSearchParams(args[0].url.replace('/','').replace('?', ''));
        const token = params.get('token');

        try
        {
            const payload = this.authService.verify(token);
            if( !('username' in payload) )
            {
                throw new Error();
            }

            this.sessions.set(payload.username, socket);
            //console.log(this.sessions);

            this.logger.log('CONNECTION SUCCESS payload:' + JSON.stringify(payload));
        }
        catch( exception )
        {
            this.logger.log('CONNECTION FAILURE token:' + token);

            let e = new InvalidTokenException();
            socket.send(JSON.stringify(e.getError()));
            socket.close();
        }
    }

    handleDisconnect( socket: Socket )
    {
        this.logger.log('DISCONNECTION');
        //console.log(this.sessions);
    }

    @SubscribeMessage('create_room')
    @UseInterceptors(AuthInterceptor)
    async createRoom(
        @ConnectedSocket() socket: Socket,
        @MessageBody('username') username: string,
        @MessageBody('name') name: string,
        @MessageBody('password') password: string
    ): Promise<any>
    {
        this.logger.log('CREATE_ROOM' + ' username:' + username + ' name:' + name + ' password:' + password);

        const room = await this.roomService.create(username, name, password);

        return new GenericResponse('create_room_response', { room });
    }

    @SubscribeMessage('join_room')
    @UseInterceptors(AuthInterceptor)
    async joinRoom(
        @ConnectedSocket() socket: Socket,
        @MessageBody('username') username: string,
        @MessageBody('name') name: string,
        @MessageBody('password') password: string
    ): Promise<any>
    {
        this.logger.log('JOIN_ROOM' + ' username:' + username + ' name:' + name + ' password:' + password);

        const room = await this.roomService.join(username, name, password);

        return new GenericResponse('join_room_response', { room });
    }
}
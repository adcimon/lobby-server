import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'dgram';
import { GenericErrorException } from './generic-error.exception';

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter
{
    catch( exception: WsException, host: ArgumentsHost )
    {
        const socket = host.switchToWs().getClient() as Socket;

        if( !(exception instanceof WsException) )
        {
            let e = new GenericErrorException((exception as Error)?.message);
            socket.send(JSON.stringify(e.getError()));
        }
        else
        {
            socket.send(JSON.stringify(exception.getError()));
        }
    }
}
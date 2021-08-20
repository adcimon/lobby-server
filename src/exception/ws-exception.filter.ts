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
        const data = host.switchToWs().getData();

        // Check whether the exception is generic.
        if( !(exception instanceof WsException) )
        {
            exception = new GenericErrorException((exception as Error)?.message);
        }

        // Add the UUID to the error.
        let e = exception.getError() as object;
        e['data']['uuid'] = data.uuid;

        socket.send(JSON.stringify(e));
    }
}
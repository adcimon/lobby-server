import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Socket } from 'dgram';
import { map } from 'rxjs';
import { InvalidTokenException } from '../exception/invalid-token.exception';

@Injectable()
export class AuthInterceptor implements NestInterceptor
{
    constructor( private readonly authService: AuthService )
    {
    }

    intercept( context: ExecutionContext, next: CallHandler ): any
    {
        const socket = context.switchToWs().getClient() as Socket;
        const data = context.switchToWs().getData();
        const token = data.token;

        try
        {
            // Verify the token.
            const payload = this.authService.verify(token);
            if( !payload || !('username' in payload) )
            {
                throw new Error();
            }

            // Remove the token from the message.
            delete data.token;

            // Add the username to the message.
            data.username = payload.username;

            return next.handle().pipe(map(data => (data)));
        }
        catch( exception )
        {
            exception = new InvalidTokenException();

            // Add the uuid to the error.
            let error = exception.getError() as object;
            error['data']['uuid'] = data.uuid;

            socket.send(JSON.stringify(error));
            socket.close();

            return;
        }
    }
}
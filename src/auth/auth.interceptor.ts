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
        const token = data['token'];

        try
        {
            // Verify the token, remove the token from the message and add the username to the message.
            const payload = this.authService.verify(token);
            if( !('username' in payload) )
            {
                throw new Error();
            }

            delete data['token'];
            data['username'] = payload.username;

            return next.handle().pipe(map(data => (data)));
        }
        catch( exception )
        {
            let e = new InvalidTokenException();
            socket.send(JSON.stringify(e.getError()));
            socket.close();
        }
    }
}
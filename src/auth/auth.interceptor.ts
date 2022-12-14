import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { AuthService } from './auth.service';
import { WebSocket } from 'ws';
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
		const socket: WebSocket = context.switchToWs().getClient() as WebSocket;
		const data: any = context.switchToWs().getData();
		const token: any = data.token;

		try
		{
			// Verify the token.
			const payload: any = this.authService.verify(token);
			if( !payload || !('sub' in payload) )
			{
				throw new Error();
			}

			// Remove the token from the message.
			delete data.token;

			// Add the username to the message.
			data.username = payload.sub;

			return next.handle().pipe(map(data => (data)));
		}
		catch( exception: any )
		{
			exception = new InvalidTokenException();

			// Add the uuid to the error.
			let error: object = exception.getError() as object;
			error['data']['uuid'] = data.uuid;

			socket.send(JSON.stringify(error));
			socket.close();

			return;
		}
	}
}
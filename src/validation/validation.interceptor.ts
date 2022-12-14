import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { WebSocket } from 'ws';
import { Observable, map, EMPTY } from 'rxjs';
import { ValidationErrorException } from '../exceptions/validation-error.exception';

@Injectable()
export class ValidationInterceptor implements NestInterceptor
{
	constructor( private readonly schema: any )
	{
	}

	async intercept( context: ExecutionContext, next: CallHandler ): Promise<Observable<any>>
	{
		const socket: WebSocket = context.switchToWs().getClient() as WebSocket;
		const data: any = context.switchToWs().getData();

		try
		{
			await this.schema.validate(data, { abortEarly: false });
			return next.handle().pipe(map(data => (data)));
		}
		catch( exception )
		{
			let message: any = (exception.errors.length == 1) ? exception.errors[0] : exception.errors;
			exception = new ValidationErrorException(message);

			// Add the uuid to the error.
			let error: object = exception.getError() as object;
			error['data']['uuid'] = data.uuid;

			socket.send(JSON.stringify(error));
			//socket.close();

			return EMPTY;
		}
	}
}
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { WebSocket } from 'ws';
import { Observable, map, EMPTY } from 'rxjs';
import { ValidationErrorException } from '../exceptions/validation-error.exception';

@Injectable()
export class ValidationInterceptor implements NestInterceptor {
	constructor(private readonly schema: any) {}

	async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
		const socket: WebSocket = context.switchToWs().getClient() as WebSocket;
		const data: any = context.switchToWs().getData();

		try {
			await this.schema.validate(data, { abortEarly: false });
			return next.handle().pipe(map((data) => data));
		} catch (exception: any) {
			const message: string = exception?.errors.length === 1 ? exception.errors[0] : exception.errors.join('. ');
			const validationException: ValidationErrorException = new ValidationErrorException(message);

			// Add the uuid to the error.
			const error: any = validationException.getError();
			error.data.uuid = data.uuid;

			const errorMessage: string = JSON.stringify(error);
			socket.send(errorMessage);
			//socket.close();

			return EMPTY;
		}
	}
}

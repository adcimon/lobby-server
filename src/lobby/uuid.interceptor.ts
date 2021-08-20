import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class UuidInterceptor implements NestInterceptor
{
    constructor()
    {
    }

    intercept( context: ExecutionContext, next: CallHandler ): Observable<any>
    {
        const data = context.switchToWs().getData();
        const uuid = data.uuid;

        return next.handle().pipe(map(data =>
        {
            // Add the uuid to the response.
            data.data.uuid = uuid;

            return data;
        }));
    }
}
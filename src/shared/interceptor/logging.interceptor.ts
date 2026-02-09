import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    this.logger.log(`Request: ${request.method} ${request.url}`, {
      headers: request.headers,
      body: request.body,
    });

    return next.handle().pipe(
      tap((data) => {
        this.logger.log(`Response: ${response.statusCode}`, {
          headers: response.headers,
          // data: data, // response body
        });
      }),
    );
  }
}

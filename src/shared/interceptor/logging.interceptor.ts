import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    this.logger.log(`Request: ${request.method} ${request.url}`, {
      headers: request.headers,
      body: request.body as Record<string, any>,
    });

    return next.handle().pipe(
      tap(() => {
        this.logger.log(`Response: ${response.statusCode}`, {
          headers: response.getHeaders(),
          // data: data, // response body
        });
      }),
    );
  }
}

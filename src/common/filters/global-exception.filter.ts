import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse: any =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message =
      typeof exceptionResponse === 'object' && exceptionResponse?.message
        ? exceptionResponse.message
        : exception.message || 'Internal server error';

    const errorName =
      typeof exceptionResponse === 'object' && exceptionResponse?.error
        ? exceptionResponse.error
        : exception.name || 'Error';

    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${status} - Message: ${JSON.stringify(
        message,
      )}`,
      exception?.stack,
    );

    response.status(status).json({
      statusCode: status,
      error: errorName,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

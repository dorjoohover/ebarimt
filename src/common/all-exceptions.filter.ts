import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AppLogger } from '../base/logger';
import { Request } from 'express';
import { ErrorLogService } from 'src/error-logs/error-log.service';
const logger = new AppLogger();

@Catch(Error)
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly errorLogService: ErrorLogService,
  ) {}

  async catch(exception: Error, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    try {
      const request = ctx.getRequest<Request>();
      const clientIp = request.ip || '';
      let status = 500;
      let message = 'Internal server error';

      if (exception instanceof HttpException) {
        status = exception.getStatus();
        message = exception.message as string;
      } else if (exception instanceof Error) {
        message = exception.message;
      }
      // Log error in PostgreSQL with IP

      await this.errorLogService.logError(
        exception,
        message,
        status,
        clientIp,
        request,
      );
      logger.error({
        message: message,
        event: exception.name,
        client: ctx.getRequest()?.user,
        stack: exception.stack,
        url: request.url,
      });
    } catch (error) {
      console.log(error);
    }

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      succeed: false,
      message: exception.message || 'Системийн алдаа',
      statusCode: httpStatus,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}

import {ArgumentsHost, Catch, HttpException, HttpServer, HttpStatus} from '@nestjs/common';
import {AbstractHttpAdapter, BaseExceptionFilter} from '@nestjs/core';
import {MESSAGES} from '@nestjs/core/constants';
import {Request} from 'express';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();

    const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    log.error(
      {
        err: exception,
        requestId: asyncContext.requestId,
        status: httpStatus,
        method: req.method,
        url: req.url,
        path: asyncContext.path,
        query: req.query,
        body: req.body,
        pathParams: req.params
      },
      'An error occurred while processing the request'
    );

    super.catch(exception, host);
  }

  // this method is copy of parents handleUnknownError without logging
  public handleUnknownError(exception: unknown, host: ArgumentsHost, applicationRef: AbstractHttpAdapter | HttpServer) {
    const body = this.isHttpError(exception)
      ? {
          statusCode: exception.statusCode,
          message: exception.message
        }
      : {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: MESSAGES.UNKNOWN_EXCEPTION_MESSAGE
        };

    const response = host.getArgByIndex(1);
    if (!applicationRef.isHeadersSent(response)) {
      applicationRef.reply(response, body, body.statusCode);
    } else {
      applicationRef.end(response);
    }
  }
}

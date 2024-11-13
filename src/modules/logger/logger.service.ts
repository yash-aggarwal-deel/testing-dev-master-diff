import {Injectable, LoggerService, Optional, Scope} from '@nestjs/common';

@Injectable({scope: Scope.TRANSIENT})
export class DeelLoggerService implements LoggerService {
  private logger: PinoLogger;

  constructor(
    @Optional()
    protected context?: string
  ) {
    this.logger = context ? log.child({context: context}) : log;
  }

  log(message: any, context?: string): void;
  log(message: any, params?: any, ...optionalParams: any[]): void {
    if (typeof params == 'string' && optionalParams.length === 0) {
      this.logger.info({context: params}, message);
    } else {
      this.logger.info(params instanceof Object ? params : {params}, message, optionalParams ? optionalParams : {});
    }
  }

  error(message: any, context?: string): void;
  error(message: any, params?: any, ...optionalParams: any[]) {
    if (typeof params == 'string' && optionalParams.length === 0) {
      this.logger.error({context: params}, message);
    } else {
      this.logger.error(params instanceof Object ? params : {params}, message, optionalParams ? optionalParams : {});
    }
  }

  warn(message: any, context?: string): void;
  warn(message: any, params?: any, ...optionalParams: any[]) {
    if (typeof params == 'string' && optionalParams.length === 0) {
      this.logger.warn({context: params}, message);
    } else {
      this.logger.warn(params instanceof Object ? params : {params}, message, optionalParams ? optionalParams : {});
    }
  }
}

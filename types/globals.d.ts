import {IncomingHttpHeaders} from 'http';
import {Logger} from 'pino';
import {ParsedQs} from 'qs';

declare global {
  interface AsyncContextData {
    method: string;
    url: string;
    path: string;
    query: ParsedQs;
    pathParams: Record<string, string>;
    requestId: string;
    userId?: string | undefined;
    user?: string | undefined;
    ip?: string;
    headers: IncomingHttpHeaders;
  }

  type NonError<T> = T extends Error ? never : T;
  export type LogData = {
    [key: string]: NonError<unknown>;
    error?: never; // use err instead
    errorObj?: never; // use err instead
    e?: never; // use err instead
  } & {err?: unknown};

  export type PinoLogger = Omit<Logger, 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'> & {
    fatal(message: string): void;
    fatal(logData: LogData, message?: string, ...args: Array<unknown>): void;
    error(message: string): void;
    error(logData: LogData, message?: string, ...args: Array<unknown>): void;
    warn(message: string): void;
    warn(logData: LogData, message?: string, ...args: Array<unknown>): void;
    info(message: string): void;
    info(logData: LogData, message?: string, ...args: Array<unknown>): void;
    debug(message: string): void;
    debug(logData: LogData, message?: string, ...args: Array<unknown>): void;
    trace(message: string): void;
    trace(logData: LogData, message?: string): void;
  };

  const log: PinoLogger;

  const asyncContext: AsyncContextData | any;
}

export {};

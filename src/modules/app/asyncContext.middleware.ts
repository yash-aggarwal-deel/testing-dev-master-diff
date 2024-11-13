import {Injectable, NestMiddleware} from '@nestjs/common';
import {randomBytes} from 'crypto';
import {NextFunction, Request} from 'express';

@Injectable()
export class AsyncContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const context = getRequestContext(req);
    asyncContext(context, next);
  }
}

function getRequestContext(req: Request): AsyncContextData {
  return {
    requestId: req.headersDistinct['x-request-id']?.at(0) || randomBytes(12).toString('hex'),
    url: req.url,
    query: req.query,
    method: req.method,
    path: req.path,
    pathParams: req.params,
    userId: req.headersDistinct['x-user-id']?.at(0),
    ip: req.ip,
    headers: req.headers
  };
}

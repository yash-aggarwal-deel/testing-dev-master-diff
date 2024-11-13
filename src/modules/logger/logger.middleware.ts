import {Injectable, NestMiddleware} from '@nestjs/common';
import {NextFunction, Request, Response} from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor() {}

  use(req: Request, res: Response, next: NextFunction) {
    const requestContext = {
      method: req.method,
      url: req.url,
      query: req.query,
      pathParams: req.params,
      userId: asyncContext.userId,
      requestId: asyncContext.requestId,
      headers: {
        'x-stage': req.headers['x-stage'],
        'x-request-id': req.headers['x-request-id']
      }
    };

    if (!req.url.startsWith('/health')) {
      log.info(
        {
          context: 'http',
          body: req.body,
          ...requestContext
        },
        `incoming request: ${req.method} ${req.url}`
      );
    }

    const start = performance.now();

    res.on('close', () => {
      const end = performance.now();
      const durationMs = end - start;
      const level = res.statusCode >= 400 ? 'error' : 'info';
      if (!req.url.startsWith('/health') || res.statusCode !== 200) {
        log[level](
          {
            context: 'http',
            httpCode: res.statusCode,
            duration: durationMs * 1e6, // DD expect nanoseconds
            ...requestContext
          },
          `finished request: ${req.method} ${req.url} with code ${res.statusCode}`
        );
      }
    });

    return next();
  }
}

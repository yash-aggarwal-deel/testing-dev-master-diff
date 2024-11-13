// it's important to keep this import at the top in all entrypoints
import '@letsdeel/init';

import {ConfigService} from '@nestjs/config';
import {NestFactory} from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
import {HttpConfig} from './config/app.conf';
import {AppModule} from './modules/app/app.module';
import {DeelLoggerService} from './modules/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new DeelLoggerService('app')
  });

  /**
   * We disable this in purpose to prevent implicit caching.
   * In most cases this won't be used for API communication anyway.
   * If using ETag is required then it's recommended to enable it explicitly on endpoint.
   *
   * More details: https://github.com/letsdeel/service-template/pull/17#discussion_r1644225682
   */
  app.disable('etag');
  // disabled for security reason to not expose internals
  app.disable('x-powered-by');
  app.enableShutdownHooks();

  const port = app.get(ConfigService<HttpConfig>).getOrThrow('port');
  await app.listen(port, () => {
    log.info({context: 'app'}, `app listening on :${port}`);
  });
}

bootstrap();

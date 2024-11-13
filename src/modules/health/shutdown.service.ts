import {Injectable, OnApplicationShutdown} from '@nestjs/common';

@Injectable()
export class ShutdownService implements OnApplicationShutdown {
  onApplicationShutdown(signal?: string | undefined) {
    log.info({context: ShutdownService.name, signal}, `received signal '${signal}', shutting down`);
  }
}

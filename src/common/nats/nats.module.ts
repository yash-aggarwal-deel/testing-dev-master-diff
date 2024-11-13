import {Global, Module, OnApplicationShutdown, OnModuleInit} from '@nestjs/common';

import {NatsClientService} from './nats-client.service';

@Global()
@Module({
  providers: [NatsClientService],
  exports: [NatsClientService]
})
export class NatsModule implements OnModuleInit, OnApplicationShutdown {
  constructor(private readonly natsClientService: NatsClientService) {}

  async onModuleInit() {
    await this.natsClientService.getConnection();
  }

  async onApplicationShutdown() {
    await this.natsClientService.gracefulShutdown();
  }
}

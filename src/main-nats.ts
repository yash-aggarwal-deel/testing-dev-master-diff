/**
 * This file is the entry point for running all consumers at once in same process.
 * This can be used for local development or for running all consumers.
 * Its also useful for running all consumers in giger environments to save cost.
 */

import '@letsdeel/init';
import {NestFactory} from '@nestjs/core';
import {AppModule} from './modules/app/app.module';
import {HelloConsumer} from './modules/hello/hello.consumer';
import {DeelLoggerService} from './modules/logger/logger.service';

const CONSUMERS: Array<any> = [
  HelloConsumer
  // Add more consumers here
];

const init = async () => {
  let filteredConsumers = CONSUMERS;

  const selectedConsumers = process.argv.slice(2);
  if (selectedConsumers.length) {
    filteredConsumers = CONSUMERS.filter((consumer) => selectedConsumers.includes(consumer.name));
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: new DeelLoggerService('app')
  });
  app.enableShutdownHooks();

  await Promise.all(
    filteredConsumers.map(async (consumer) => {
      try {
        log.info(`Starting listener ${consumer.name}`);
        const instance = app.get(HelloConsumer);
        await instance.listenForMessages();
      } catch (err) {
        log.error(err as LogData, `Listener failed ${consumer}. Cleaning up and exiting`);
        await app.close();

        process.exit(1);
      }
    })
  );
};

init().catch((err: LogData) => log.error({err}, (err?.message as string) || 'Consumer failed with an error'));

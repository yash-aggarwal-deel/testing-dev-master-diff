import {getSequelizeDbConfig} from '@deel-core/sequelize-flavours';
import {MiddlewareConsumer, Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {APP_FILTER} from '@nestjs/core';
import {NatsModule} from 'src/common/nats/nats.module';
import {HelloModule} from 'src/modules/hello/hello.module';
import {LoggerModule} from 'src/modules/logger/logger.module';
import {httpConfig, natsConfig} from '../../config/app.conf';
import {DatabaseModule} from '../database/database.module';
import {HealthModule} from '../health/health.module';
import {LoggerMiddleware} from '../logger/logger.middleware';
import {AsyncContextMiddleware} from './asyncContext.middleware';
import {AllExceptionsFilter} from './exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [getSequelizeDbConfig, httpConfig, natsConfig]
    }),
    NatsModule,
    LoggerModule,
    DatabaseModule,
    HealthModule,
    HelloModule
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter
    }
  ]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AsyncContextMiddleware, LoggerMiddleware).forRoutes('/');
  }
}

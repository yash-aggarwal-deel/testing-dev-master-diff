import {getSequelizeDbConfig} from '@deel-core/sequelize-flavours';
import {Module} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {SequelizeModule, SequelizeModuleOptions} from '@nestjs/sequelize';
import type {DatabaseConfig} from 'src/config/app.conf';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: (configService: ConfigService<DatabaseConfig>): SequelizeModuleOptions => {
        const sequelizeDBConfig = getSequelizeDbConfig({
          applicationName: configService.getOrThrow('applicationName'),
          schema: configService.getOrThrow('schema'),
          poolSize: configService.getOrThrow('pool'),
          readReplicaHosts: configService.getOrThrow('replication'),
          logQueries: configService.getOrThrow('logQueries'),
          slowQueriesMs: configService.getOrThrow('slowQueryTimeMs')
          // logger: log // TODO: check if I can edit the PinoLogger behavior
        });

        return {
          ...sequelizeDBConfig,
          autoLoadModels: true,
          synchronize: false
        };
      },
      inject: [ConfigService]
    })
  ]
})
export class DatabaseModule {}

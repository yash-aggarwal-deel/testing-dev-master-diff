import {injectContextComments} from '@deel-core/sequelize-flavours';
import {Module} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {SequelizeModule, SequelizeModuleOptions} from '@nestjs/sequelize';
import {Sequelize} from 'sequelize-typescript';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: (configService: ConfigService): SequelizeModuleOptions => {
        const sequelizeModuleOptions: SequelizeModuleOptions = {
          uri: configService.getOrThrow('parsedDbUrl'),
          autoLoadModels: true,
          synchronize: false
        };
        return {
          ...configService.getOrThrow('options'),
          ...sequelizeModuleOptions
        };
      },
      inject: [ConfigService]
    })
  ]
})
export class DatabaseModule {
  constructor(sequelize: Sequelize) {
    injectContextComments(sequelize);
  }
}

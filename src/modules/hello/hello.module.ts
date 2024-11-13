import {Module} from '@nestjs/common';
import {SequelizeModule} from '@nestjs/sequelize';
import {HelloConsumer} from './hello.consumer';
import {HelloController} from './hello.controller';
import {Dummy} from './models/dummy.model';

@Module({
  imports: [SequelizeModule.forFeature([Dummy])],
  controllers: [HelloController],
  providers: [HelloConsumer]
})
export class HelloModule {}

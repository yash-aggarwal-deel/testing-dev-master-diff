import {Module} from '@nestjs/common';
import {DeelLoggerService} from './logger.service';

@Module({
  providers: [DeelLoggerService],
  exports: [DeelLoggerService]
})
export class LoggerModule {}

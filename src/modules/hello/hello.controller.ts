import {Controller, Get, Param} from '@nestjs/common';

@Controller('hello')
export class HelloController {
  @Get(':friend')
  hello(@Param('friend') friend: string): string {
    log.info({context: HelloController.name, friend}, 'for logging we use global pino logger from @letsdeel/init');
    return `Howdy, ${friend}!`;
  }
}

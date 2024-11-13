import {Message} from '@letsdeel/nats-lib';
import {Test, TestingModule} from '@nestjs/testing';

import {ConfigModule} from '@nestjs/config';
import {NatsModule} from 'src/common/nats/nats.module';
import {natsConfig} from 'src/config/app.conf';
import {HelloConsumer} from './hello.consumer';

describe('HelloConsumer', () => {
  let consumer: HelloConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        NatsModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [natsConfig]
        })
      ],
      providers: [HelloConsumer]
    }).compile();

    consumer = module.get<HelloConsumer>(HelloConsumer);
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  it('should log message when calling messageHandler', async () => {
    const logSpy = jest.spyOn(log, 'info');
    const mockMessage: Message = {
      data: {},
      metadata: {seq: 1, sid: 1, redeliveryCount: 1, subject: 'hello.call'},
      natsMessage: {} as any
    };

    await consumer.messageHandler(mockMessage);
    expect(logSpy).toHaveBeenCalledWith(
      {
        data: mockMessage.data,
        metadata: mockMessage.metadata
      },
      'Consuming hello.* message'
    );
  });
});

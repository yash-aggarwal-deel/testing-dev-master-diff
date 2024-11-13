import {Message} from '@letsdeel/nats-lib';
import {Injectable} from '@nestjs/common';

import {BaseNatsConsumer} from '../../common/nats/base-nats.consumer';
import {NatsClientService} from '../../common/nats/nats-client.service';

@Injectable()
export class HelloConsumer extends BaseNatsConsumer {
  /**
   * Name of the stream
   */
  static STREAM_NAME: string = 'local';

  /**
   * Subjects to consume from
   */
  static SUBJECTS: string | Array<string> = 'hello.*';

  /**
   * Durable name identifying this consumer in the NATS server
   */
  static DURABLE_NAME: string = 'hello-consumer';

  /**
   * Number of max redeliveries of same message in case of errors
   */
  static MAX_RETRIES: number = 5;

  /**
   * Timeout for the ACK to happen. In case a message is not acked before this, message will be redelivered
   */
  static ACK_WAIT: number = 10_000;

  constructor(protected readonly natsClientService: NatsClientService) {
    super(
      HelloConsumer.STREAM_NAME,
      HelloConsumer.SUBJECTS,
      HelloConsumer.DURABLE_NAME,
      {
        max_deliver: HelloConsumer.MAX_RETRIES,
        ack_wait: HelloConsumer.ACK_WAIT
      },
      natsClientService
    );
  }

  async messageHandler({data, metadata}: Message) {
    log.info({data, metadata}, 'Consuming hello.* message');
  }
}

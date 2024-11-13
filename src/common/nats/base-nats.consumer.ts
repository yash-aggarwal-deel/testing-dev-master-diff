import type {ConsumerConfig, Message} from '@letsdeel/nats-lib';

import type {NatsClientService} from './nats-client.service';

export abstract class BaseNatsConsumer {
  /**
   * Stream name
   */
  streamName: string;

  /**
   * A single subject or any array of subjects to listen
   */
  subjects: string | Array<string>;

  /**
   * Durable consumer name
   */
  durableName: string;

  /**
   * Consumer config
   */
  consumerConfig: Partial<ConsumerConfig>;

  /**
   * Constructor
   * @param {NatsClientService} natsClientService client service provided by NatsModule
   * @param {string} streamName stream name
   * @param {string | string[]} subjects a single subject or array of subjects to listen
   * @param {string} durableName durable consumer name
   * @param {Partial<ConsumerConfig>} consumerConfig consumer config
   */
  constructor(
    streamName: string,
    subjects: string | Array<string>,
    durableName: string,
    consumerConfig: Partial<ConsumerConfig>,
    protected readonly natsClientService: NatsClientService
  ) {
    this.streamName = streamName;
    this.subjects = subjects;
    this.durableName = durableName;
    this.consumerConfig = consumerConfig;
  }

  /**
   * Handler for each received message.
   * Should be overridden by the child of this class with the appropriate message handling logic
   * @param {Message} message contents of the received message, with metadata
   */
  abstract messageHandler(message: Message): Promise<void>;

  /**
   * Subscribe to the provided NATS stream, listening to the given subjects.
   * Attaches `this.messageHandler` as the callback for each message received
   */
  async listenForMessages() {
    await this.natsClientService.consume({
      streamName: this.streamName,
      consumerConfig: {
        ...this.consumerConfig,
        filter_subjects: Array.isArray(this.subjects) ? this.subjects : [this.subjects],
        durable_name: this.durableName
      },
      messageHandler: async (message: Message) => {
        await this.messageHandler(message);
      }
    });
  }
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Message,
  NatsConnection,
  NatsJetStreamConsumerParams,
  PubAck,
  ReplayEvent,
  ReplayOptions,
  createConnection,
  natsJetStream,
  startGracefulShutdown
} from '@letsdeel/nats-lib';
import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class NatsClientService {
  connectionPromise: Promise<NatsConnection> | undefined;

  constructor(private readonly configService: ConfigService) {}

  async getConnection(): Promise<NatsConnection> {
    if (!this.connectionPromise) {
      this.connectionPromise = createConnection({
        servers: this.configService.getOrThrow('natsUrl'),
        user: this.configService.getOrThrow('natsUser'),
        pass: this.configService.getOrThrow('natsPassword')
      });
    }

    return this.connectionPromise;
  }

  async publish(streamName: string, subject: string, payload: object, headers: object): Promise<PubAck | null> {
    const connection = await this.getConnection();

    return natsJetStream.publish({connection, subject, payload, streamName, headers, logger: log});
  }

  async consume({streamName, consumerConfig, messageHandler}: Omit<NatsJetStreamConsumerParams, 'connection'>): Promise<void | null> {
    const connection = await this.getConnection();

    await natsJetStream.consume({
      connection,
      streamName,
      consumerConfig,
      messageHandler: async (message: Message) => {
        const {metadata, data} = message;

        await asyncContext({requestId: message.metadata.requestId || `${streamName}:${metadata.subject}:${metadata.seq}`}, async () => {
          await messageHandler({data, metadata});
        });
      },
      logger: log
    });
  }

  async replay(
    streamName: string,
    options: ReplayOptions,
    messageHandler: (msg: ReplayEvent) => void | Promise<void>
  ): Promise<void | null> {
    const connection = await this.getConnection();

    await natsJetStream.replay({connection, streamName, options, messageHandler, logger: log});
  }

  async gracefulShutdown(): Promise<void> {
    const connection = await this.connectionPromise;

    if (!connection) return;
    await startGracefulShutdown(connection);
  }
}

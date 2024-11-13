export interface HttpConfig {
  port: number;
}

export interface NatsConfig {
  natsUrl: string;
  natsUser: string;
  natsPassword: string;
}

function httpConfig(): HttpConfig {
  return {
    port: Number(process.env.PORT) || 3000
  };
}

function natsConfig(): NatsConfig {
  return {
    natsUrl: process.env.NATS_URL || '',
    natsUser: process.env.NATS_USER || '',
    natsPassword: process.env.NATS_PASSWORD || ''
  };
}

export {httpConfig, natsConfig};

import {ReplicationOptions} from 'sequelize';

export interface HttpConfig {
  port: number;
}

export interface DatabaseConfig {
  url: string;
  schema: string;
  replication: ReplicationOptions | false;
  pool: {
    max: number;
    acquire: number;
    idle: number;
  };
  applicationName: string;
  logQueries: boolean;
  slowQueryTimeMs: number;
}

export interface NatsConfig {
  natsUrl: string;
  natsUser: string;
  natsPassword: string;
}

function parseDbUrl(urlString: string | undefined): {url: string; schema: string} {
  if (!urlString) {
    throw new Error('database url is required');
  }

  const url = new URL(urlString);
  if (url.hash.length) {
    throw new Error('please migrate to schema as query parameter e.g. postgres://deel:deel@localhost:5432?schema=your_schema');
  }

  const schema = url.searchParams.get('schema') || 'public';
  url.searchParams.delete('schema');

  return {url: url.href, schema: schema};
}

function parseReplicaUrls(replicationUrl: string): ReplicationOptions {
  const replicaUrls = replicationUrl.split(',').map((url) => {
    return {host: url};
  });

  return {
    read: replicaUrls,
    write: {}
  };
}

function dbConfig(): DatabaseConfig {
  const slowQueryTimeMs = Number(process.env.DATABASE_LOG_QUERIES_MS) || 0;
  const {url, schema} = parseDbUrl(process.env.DATABASE_URL);
  const replicationUrls = process.env.DATABASE_READ_REPLICA_HOSTS || '';

  return {
    url: url,
    schema: schema,
    replication: replicationUrls ? parseReplicaUrls(replicationUrls) : false,
    pool: {
      max: Number(process.env.DATABASE_POOL_SIZE) || 5,
      acquire: 30_000,
      idle: 60_000
    },
    applicationName: process.env.DD_SERVICE || '',
    logQueries: process.env.DATABASE_LOG_QUERIES === 'true',
    slowQueryTimeMs: slowQueryTimeMs
  };
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

export {dbConfig, httpConfig, natsConfig, parseDbUrl, parseReplicaUrls};

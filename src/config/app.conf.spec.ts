import {dbConfig, parseDbUrl, parseReplicaUrls} from './app.conf';

describe('parseDbUrl', () => {
  it('should return an object of {url: string, schema: string}', () => {
    // Given
    const connectionString = 'postgres://myuser:mypass@postgres-deel/deel?schema=hr';

    // When
    const connectionParams = parseDbUrl(connectionString);

    // Then
    expect(connectionParams).toEqual({schema: 'hr', url: 'postgres://myuser:mypass@postgres-deel/deel'});
  });

  it('should parse schema from query param ?schema when other params are present', () => {
    // Given
    const connectionString = 'postgres://myuser:mypass@postgres-deel/deel?schema=benefits&?replication=dev-db-ro.postgres-deel';

    // When
    const connectionParams = parseDbUrl(connectionString);

    // Then
    expect(connectionParams.schema).toEqual('benefits');
  });

  it('should fallback to "public" schema if cannot find it in url', () => {
    // Given
    const connectionString = 'postgres://myuser:mypass@postgres-deel/deel';

    // When
    const connectionParams = parseDbUrl(connectionString);

    // Then
    expect(connectionParams.schema).toEqual('public');
  });

  it('should throw when using # schema format', () => {
    // Given
    const connectionString = 'postgres://myuser:mypass@postgres-deel/deel#hr';

    // Then
    expect(() => parseDbUrl(connectionString)).toThrow();
  });

  test.each([['postgres://myuser:d2323#fx@postgres-deel/deel?replication=dev-db-ro.postgres-deel#hr'], [''], [undefined]])(
    'should throw and error if URL is invalid %#',
    (connectionString) => {
      expect(() => parseDbUrl(connectionString)).toThrow();
    }
  );
});

describe('parseReplicaUrls', () => {
  it('should return replication object when one replica provided', () => {
    // Given
    const replicaString = 'postgres-deel-replica-ro';

    // When
    const replication = parseReplicaUrls(replicaString);

    // Then
    expect(replication.read).toHaveLength(1);
    expect(replication.read[0].host).toEqual(replicaString);
  });

  it('should return replication object when many replicas provided', () => {
    // Given
    const replicaString = 'postgres-deel-replica-ro-1,postgres-deel-replica-ro-2';

    // When
    const replication = parseReplicaUrls(replicaString);

    // Then
    expect(replication.read).toHaveLength(2);
    expect(replication.read[0].host).toEqual('postgres-deel-replica-ro-1');
    expect(replication.read[1].host).toEqual('postgres-deel-replica-ro-2');
  });
});

describe('dbConfig', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {...OLD_ENV};
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it.each([
    ['0', false],
    ['1', false],
    ['', false],
    ['true', true],
    ['false', false]
  ])('should set log queries to %p when env.DATABASE_LOG_QUERIES is %p', (given: string, expected: boolean) => {
    // Given
    process.env.DATABASE_URL = 'postgres://myuser:mypass@postgres-deel/deel';
    process.env.DATABASE_LOG_QUERIES = given;

    // When
    const config = dbConfig();

    // Then
    expect(config.logQueries).toBe(expected);
  });

  it('should return config object when env variables are set', () => {
    // Given
    process.env.DATABASE_URL = 'postgresql://deel:admin@127.0.0.1:5432/deel?schema=schema_tests';
    process.env.DATABASE_READ_REPLICA_HOSTS = '';
    process.env.DATABASE_LOG_QUERIES = 'false';
    process.env.DATABASE_LOG_QUERIES_MS = '3000';
    process.env.DD_SERVICE = 'tests';

    // When
    const config = dbConfig();

    // Then
    expect(config.applicationName).toEqual('tests');
    expect(config.logQueries).toEqual(false);
    expect(config.pool).toEqual({acquire: 30000, idle: 60000, max: 5});
    expect(config.replication).toEqual(false);
    expect(config.schema).toEqual('schema_tests');
    expect(config.slowQueryTimeMs).toEqual(3000);
    expect(config.url).toEqual('postgresql://deel:admin@127.0.0.1:5432/deel');
  });

  it('should return replicas config when env variables are set', () => {
    // Given
    process.env.DATABASE_URL = 'postgresql://deel:admin@127.0.0.1:5432/deel?schema=schema_tests';
    process.env.DATABASE_READ_REPLICA_HOSTS = 'deel-ro';
    process.env.DATABASE_LOG_QUERIES = 'false';
    process.env.DATABASE_LOG_QUERIES_MS = '3000';
    process.env.DD_SERVICE = 'tests';

    // When
    const config = dbConfig();

    // Then
    expect(config.applicationName).toEqual('tests');
    expect(config.logQueries).toEqual(false);
    expect(config.pool).toEqual({acquire: 30000, idle: 60000, max: 5});
    expect(config.replication).toEqual({read: [{host: 'deel-ro'}], write: {}});
    expect(config.schema).toEqual('schema_tests');
    expect(config.slowQueryTimeMs).toEqual(3000);
    expect(config.url).toEqual('postgresql://deel:admin@127.0.0.1:5432/deel');
  });

  it('should return logging config when env variables are set', () => {
    // Given
    process.env.DATABASE_URL = 'postgresql://deel:admin@127.0.0.1:5432/deel?schema=schema_tests';
    process.env.DATABASE_READ_REPLICA_HOSTS = 'deel-ro';
    process.env.DATABASE_LOG_QUERIES = 'true';
    process.env.DATABASE_LOG_QUERIES_MS = '3000';
    process.env.DD_SERVICE = 'tests';

    // When
    const config = dbConfig();

    // Then
    expect(config.applicationName).toEqual('tests');
    expect(config.logQueries).toEqual(true);
    expect(config.pool).toEqual({acquire: 30000, idle: 60000, max: 5});
    expect(config.replication).toEqual({read: [{host: 'deel-ro'}], write: {}});
    expect(config.schema).toEqual('schema_tests');
    expect(config.slowQueryTimeMs).toEqual(3000);
    expect(config.url).toEqual('postgresql://deel:admin@127.0.0.1:5432/deel');
  });
});

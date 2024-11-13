import {Injectable, Module} from '@nestjs/common';
import {InjectModel, SequelizeModule} from '@nestjs/sequelize';
import {Test, TestingModule} from '@nestjs/testing';
import _ from 'lodash';
import {InferAttributes, InferCreationAttributes, Transaction} from 'sequelize';
import {Column, Model, Sequelize, Table} from 'sequelize-typescript';
import {UUIDPK} from 'src/common/db/attributes';
import {randomString, uuid} from 'src/common/rand';
import {AppModule} from 'src/modules/app/app.module';

describe('Database Test', () => {
  let testModule: TestingModule;
  let sequelize: Sequelize;
  let service: TestService;

  @Table
  class TestModel extends Model<InferAttributes<TestModel>, InferCreationAttributes<TestModel, {omit: 'id'}>> {
    @UUIDPK()
    declare id: string;

    @Column
    declare name: string;
  }

  @Injectable()
  class TestService {
    constructor(@InjectModel(TestModel) private readonly testModel: typeof TestModel) {}

    async create() {
      return await this.testModel.create({name: 'test'});
    }

    get model() {
      return this.testModel;
    }

    async get(id: string) {
      return await this.testModel.findByPk(id);
    }
  }

  @Module({
    imports: [SequelizeModule.forFeature([TestModel])],
    providers: [TestService]
  })
  class TestModule {}

  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [AppModule, TestModule]
    }).compile();

    sequelize = testModule.get(Sequelize);
    await sequelize.sync({force: true});
    service = testModule.get(TestService);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a record', async () => {
    const record = await service.create();
    expect(record).toBeDefined();

    const foundRecord = await service.get(record.id);
    expect(foundRecord).toBeDefined();
    expect(foundRecord?.name).toBe('test');
  });

  describe('Audit params', () => {
    let requestId: string;
    const url = '/test/url';
    const ip = '1.1.1.1';
    const auditParamsLiteralName = `CONCAT(current_setting('SESSION.ip'), '-', current_setting('SESSION.url'))`;
    const getExpectedName = ({
      ip: ipParam = ip,
      url: urlParam = url,
      requestId: requestIdParam = requestId
    }: {ip?: string; url?: string; requestId?: string} = {}) => `${ipParam}-${urlParam} ${requestIdParam}`;

    beforeEach(() => {
      requestId = randomString();
    });

    it('should set audit params on raw create', async () => {
      const id = uuid();
      await asyncContext({requestId, url, ip}, async () => {
        await sequelize.query(`INSERT INTO test_models (id,name) VALUES (:id, ${auditParamsLiteralName})`, {replacements: {id}});
      });

      const record = await service.get(id);

      expect(record).toBeDefined();
      expect(record?.name).toBe(getExpectedName());
    });

    it('should set audit params on raw create with insert type', async () => {
      const id = uuid();
      await asyncContext({requestId, url, ip}, async () => {
        await sequelize.query(`INSERT INTO test_models (id,name) VALUES (:id, ${auditParamsLiteralName})`, {
          type: 'INSERT',
          replacements: {id}
        });
      });

      const record = await service.get(id);

      expect(record).toBeDefined();
      expect(record?.name).toBe(getExpectedName());
    });

    it('should set audit params on create', async () => {
      const id = uuid();

      await asyncContext({requestId, url, ip}, async () => {
        await service.model.create({id, name: Sequelize.literal(auditParamsLiteralName)} as never, {
          returning: false // doesn't work with literal on creation
        });
      });

      const record = await service.get(id);

      expect(record).toBeDefined();
      expect(record?.name).toBe(getExpectedName());
    });

    it('should set audit params on update', async () => {
      const id = uuid();

      await asyncContext({requestId, url, ip}, async () => {
        await service.model.create({id, name: 'hello'} as never);
        await service.model.update({name: Sequelize.literal(auditParamsLiteralName)} as never, {
          where: {id},
          returning: false // doesn't work with literal on creation
        });
      });

      const record = await service.get(id);

      expect(record).toBeDefined();
      expect(record?.name).toBe(getExpectedName());
    });

    it('should set audit params in a transaction', async () => {
      const id = uuid();

      await asyncContext({requestId, url, ip}, async () => {
        await sequelize.transaction(async (t: Transaction) => {
          await service.model.create({id, name: 'hello'} as never, {transaction: t});
          await service.model.update({name: Sequelize.literal(auditParamsLiteralName)} as never, {
            where: {id},
            returning: false, // doesn't work with literal on creation
            transaction: t
          });
        });
      });

      const record = await service.get(id);

      expect(record).toBeDefined();
      expect(record?.name).toBe(getExpectedName());
    });

    it('should set separate params in concurrent requests', async () => {
      const batchCount = 15;
      const callsPerBatch = 15;

      const totalCalls = batchCount * callsPerBatch;

      const contexts = Array.from({length: totalCalls}, (_, i) => ({
        requestId: uuid(),
        url: `/test/url/${i}`,
        ip: `${i}.${i}`
      }));

      const batches = _.chunk(contexts, callsPerBatch);

      for (const batch of batches) {
        const promises = batch.map((context) =>
          asyncContext(context, async () => {
            const serviceForContext = testModule.get(TestService);
            await serviceForContext.model.create({id: context.requestId, name: Sequelize.literal(auditParamsLiteralName)} as never, {
              returning: false // doesn't work with literal on creation
            });
          })
        );

        await Promise.all(promises);
      }

      for (const context of contexts) {
        const record = await service.get(context.requestId);
        expect(record).toBeDefined();
        expect(record?.name).toBe(getExpectedName(context));
      }
    });
  });
});

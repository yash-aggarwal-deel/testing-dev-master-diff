import {BadRequestException, Controller, Get, INestApplication, Module, Param, Post, Query} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import {Sequelize} from 'sequelize-typescript';
import {AppModule} from 'src/modules/app/app.module';
import request from 'supertest';

describe('Test setting async context', () => {
  let app: INestApplication;

  @Controller('/test')
  class TestController {
    @Get('/asyncContext/:id')
    async get(@Param('id') id: string, @Query('greeting') greeting: string) {
      return {
        asyncContext,
        greeting,
        param: id
      };
    }

    @Post('/error')
    async error() {
      throw new Error('Test error');
    }

    @Post('/http-error')
    async httpError() {
      throw new BadRequestException('very bad request');
    }
  }

  @Module({controllers: [TestController]})
  class TestModule {}

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule]
    })
      .overrideProvider(Sequelize)
      .useValue({close: jest.fn()})
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('should set async context', async () => {
    const requestId = 'test-request-id';
    const id = 'foo';
    const greeting = 'howdy';
    const response = await request(app.getHttpServer()).get(`/test/asyncContext/${id}?greeting=${greeting}`).set('x-request-id', requestId);
    const body = response.body as {asyncContext: AsyncContextData};

    expect(response.statusCode).toBe(200);
    expect(body.asyncContext).toBeDefined();
    expect(body.asyncContext).toEqual({
      headers: {
        'accept-encoding': 'gzip, deflate',
        connection: 'close',
        host: expect.any(String) as string,
        'x-request-id': 'test-request-id'
      },
      ip: expect.any(String) as string,
      method: 'GET',
      path: '/test/asyncContext/foo',
      pathParams: {},
      query: {
        greeting: 'howdy'
      },
      requestId: 'test-request-id',
      url: '/test/asyncContext/foo?greeting=howdy'
    });
  });

  afterAll(async () => {
    await app.close();
  });
});

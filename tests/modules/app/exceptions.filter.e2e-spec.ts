import {BadRequestException, Controller, INestApplication, Module, Post} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import {Sequelize} from 'sequelize-typescript';
import {AppModule} from 'src/modules/app/app.module';
import request from 'supertest';
describe('Test catching all exceptions', () => {
  let app: INestApplication;

  @Controller('/test')
  class TestController {
    @Post('/error')
    async error() {
      throw new Error('This is fine, not a real error, just testing the error handling');
    }

    @Post('/http-error')
    async httpError() {
      throw new BadRequestException('This is fine, not a real error, just testing the error handling of a bad request');
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

  it('should catch and log exceptions', async () => {
    const logSpy = jest.spyOn(log, 'error');
    const message = 'An error occurred while processing the request';
    const errorResponse = await request(app.getHttpServer()).post('/test/error').send({hello: 'world'});

    expect(errorResponse.statusCode).toBe(500);
    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: '/test/error',
        requestId: expect.any(String) as string,
        body: {hello: 'world'},
        err: expect.objectContaining({
          message: 'This is fine, not a real error, just testing the error handling',
          stack: expect.any(String) as string
        })
      }),
      message
    );

    logSpy.mockReset();

    const httpErrorResponse = await request(app.getHttpServer()).post('/test/http-error').send({hello: 'world'});

    expect(httpErrorResponse.statusCode).toBe(400);
    expect(logSpy).toHaveBeenCalledTimes(2);
    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: '/test/http-error',
        requestId: expect.any(String) as string,
        body: {hello: 'world'},
        err: expect.objectContaining({
          message: 'This is fine, not a real error, just testing the error handling of a bad request',
          stack: expect.any(String) as string
        })
      }),
      message
    );
  });

  afterAll(async () => {
    await app.close();
  });
});

import {INestApplication} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import {AppModule} from 'src/modules/app/app.module';
import request from 'supertest';

describe('hello endpoint', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    app.init();
  });

  afterEach(async () => {
    app.close();
  });

  it(`GET /hello/friend return 200 OK`, () => {
    return request(app.getHttpServer()).get('/hello/friend').expect(200).expect({});
  });

  it(`GET /hello without friend parameter returns 404`, () => {
    return request(app.getHttpServer()).get('/hello').expect(404);
  });
});

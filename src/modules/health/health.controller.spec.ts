import {Test, TestingModule} from '@nestjs/testing';
import {Sequelize} from 'sequelize-typescript';
import {HealthController} from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{provide: Sequelize, useValue: {authenticate: jest.fn()}}]
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('liveness should return OK', async () => {
    const testCase = await controller.getLiveness();
    expect(testCase).toEqual({status: 'OK'});
  });

  it('readiness should query and return OK', async () => {
    const testCase = await controller.getReadiness();
    expect(testCase).toEqual({sequelize: 'OK'});
  });
});

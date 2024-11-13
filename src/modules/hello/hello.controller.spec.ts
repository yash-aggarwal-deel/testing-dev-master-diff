import {Test, TestingModule} from '@nestjs/testing';
import {HelloController} from './hello.controller';

describe('HelloController', () => {
  let controller: HelloController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HelloController]
    }).compile();

    controller = module.get<HelloController>(HelloController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return 200 OK', async () => {
    const testCase = controller.hello('friend');
    expect(testCase).toEqual('Howdy, friend!');
  });
});

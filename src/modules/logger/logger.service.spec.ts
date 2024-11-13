import {DeelLoggerService} from './logger.service';

describe('LoggerService', () => {
  let logger: DeelLoggerService;

  beforeEach(async () => {
    logger = new DeelLoggerService();
  });

  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should log with just message', async () => {
    const logSpy = jest.spyOn(log, 'info');
    const message = 'example message';
    logger.log(message);

    expect(logSpy).toHaveBeenCalledWith({}, message, []);
  });

  it('should log with message and context', async () => {
    const logSpy = jest.spyOn(log, 'info');
    const message = 'example message';
    const context = 'tests';
    logger.log(message, context);

    expect(logSpy).toHaveBeenCalledWith({context}, message);
  });
});

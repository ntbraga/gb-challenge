import { MongoExceptionFilter } from './mongo-exception.filter';

describe('ExceptionFilter', () => {
  it('should be defined', () => {
    expect(new MongoExceptionFilter()).toBeDefined();
  });
});

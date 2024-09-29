import { handler } from '../index';

describe('handler', () => {
  it('should return "Hello world from ts-demo-service"', () => {
    const res = handler();
    expect(res).toEqual('Hello world from ts-demo-service');
  });
});

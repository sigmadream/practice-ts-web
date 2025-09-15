import { helloWorld } from '@/helloWorld';

describe('helloWorld', () => {
  it('says hello', () => {
    expect(helloWorld()).toEqual('Hello World!');
  });
});

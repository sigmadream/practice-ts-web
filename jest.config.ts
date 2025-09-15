import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }] },
  testRegex: '/__tests__/.*.test.ts$',
  verbose: true,
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
};

export default config;

import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './src',
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  collectCoverage: true,
  collectCoverageFrom: ['agent/company/companyServices/**/*.ts'],

  coverageReporters: ['text', 'lcov'],
  coverageDirectory: '<rootDir>/coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/'],
  clearMocks: true,
  coverageProvider: 'v8', 
  globals: {
    'ts-jest': {
      diagnostics: true, 
      tsconfig: './tsconfig.json', 
    },
  },
};

export default config;
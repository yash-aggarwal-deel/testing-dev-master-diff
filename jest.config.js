const common = {
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testEnvironment: 'node',
  rootDir: '.',

  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
  },

  // A map from regular expressions to paths to transformers
  // transform: undefined,
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },

  globalSetup: './tests/jest/globalSetup.ts',

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // An array of regexp patterns that are matched against all source file paths before re-running tests in watch mode
  watchPathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/results/'],

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFiles: ['./tests/jest/setupEnvVars.ts'],
};

/**
 * Unit tests: File pattern: *.spec.ts
 */
const unit = {
  ...common,

  displayName: 'unit',

  // The glob patterns Jest uses to detect test files
  testMatch: ['**/*.spec.[jt]s'],  
};

/**
 * Integration tests
 * File pattern: *.e2e-spec.ts
 */
const integration = {
  ...common,
  displayName: 'integration',

  // The glob patterns Jest uses to detect test files
  testMatch: ['**/*.e2e-spec.[jt]s']
};

module.exports = {
  workerIdleMemoryLimit: '1500mb',

  // The maximum amount of workers used to run your tests. Can be specified as % or a number. E.g. maxWorkers: 10% will use 10% of your CPU amount + 1 as the maximum worker number. maxWorkers: 2 will use a maximum of 2 workers.
  // If the tests are slow we can increase the number of workers
  maxWorkers: 4,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/main.ts',
  ],

  // The directory where Jest should output its coverage files
  coverageDirectory: 'results/html-reports/coverage',

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ['text-summary', 'lcov', 'clover'],

  // Use this configuration option to add custom reporters to Jest
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        ...(process.env.JEST_HTML_REPORTERS_PUBLIC_PATH ? {} : {publicPath: './results/html-reports'}),
        filename: 'index.html',
        openReport: false
      }
    ]
  ],

  testTimeout: 15000,
  testEnvironment: 'node',

  // TODO: setup your own threshold for service
  // An object that configures minimum threshold enforcement for coverage results
  // coverageThreshold: {
  //   global: {
  //     statements: 70,
  //     branches: 70,
  //     functions: 70,
  //     lines: 70
  //   }
  // },

  projects: [integration, unit]
};
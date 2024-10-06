module.exports = {
  modulePaths: ['<rootDir>'],
  testMatch: ['**/+(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};

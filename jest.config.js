'use strict';

module.exports = {
  'testURL': 'http://localhost:3000',
  'testEnvironment': 'node',
  'collectCoverage': true,
  'coverageDirectory': 'coverage',
  'collectCoverageFrom': [
    '**/*.js',
  ],
  'coveragePathIgnorePatterns': [
    '/node_modules/',
    '/client/',
    '/coverage/',
    '/scripts/',
    'datasources.*.js',
    '.babelrc.js',
    'jest.config.js',
  ],
  'testPathIgnorePatterns': [
    '/node_modules/',
    '/client/',
  ],
  "transform": {
    "^.+\\.(t|j)sx?$": "ts-jest"
  },
  "testRegex": "(/\./test/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  "moduleFileExtensions": ["ts", "tsx", "js", "jsx", "json", "node"]
};

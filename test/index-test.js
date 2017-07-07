import path from 'path';
import Test from './utils/test-test';

const test = new Test({
  port: 1212,
  url: 'http://localhost',
  scenariosPath: path.join(__dirname, './scenarios'),
});

test.run();

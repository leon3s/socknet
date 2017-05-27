import { ArgTypes } from '../../src';
import TestDefault from '../utils/testDefault-test';

class TestAfter extends TestDefault {

  description = '- After'

  config = {
    route: '/test/after',
    args: {
      default: ArgTypes.string,
    },
  }

  tests = [{
    name: 'After basic test',
    args: {
      default: 'default',
    },
    validationFn: this.testSuccess,
  }, {
    name: 'After must update data',
    args: {
      default: 'update',
    },
    validationFn: this.testSuccessUpdate,
  }, {
    name: 'After must return error code 404',
    args: {
      default: 'afterError404',
    },
    validationFn: this.testError404,
  }];

  after(socket, args, callback) {
    args.response.default =
      args.response.default === 'update' ? 'isUpdated' : args.response.default;
    if (args.response.default === 'afterError404')
      return callback({ code: 404 });
    callback(null, args);
  }

};

export default new TestAfter;

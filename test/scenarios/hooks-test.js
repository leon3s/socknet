import { ArgTypes } from '../../src';
import TestDefault from '../utils/testDefault-test';

class TestHook extends TestDefault {

  description = '- Hook'

  config = {
    return: true,
    route: '/test/hook',
    args: {
      default: ArgTypes.string,
    },
  }

  tests = [{
    name: 'Hook simple test',
    args: {
      default: 'default',
    },
    validationFn: this.testSuccess,
  }, {
    name: 'Hook after error',
    args: {
      default: 'afterError',
    },
    validationFn: this.testError404,
  }, {
    name: 'Hook after update data',
    args: {
      default: 'afterUpdate',
    },
    validationFn: this.testSuccessUpdate,
  }, {
    name: 'Hook before error',
    args: {
      default: 'beforeError',
    },
    validationFn: this.testError404,
  }, {
    name: 'Hook before update',
    args: {
      default: 'beforeUpdate',
    },
    validationFn: this.testSuccessUpdate,
  }];

  before(socket, args, next) {
    args.default = args.default === 'beforeUpdate' ? 'isUpdated' : args.default;
    if (args.default === 'beforeError') return next({ code: 404 });
    next();
  }

  after(socket, args, callback) {
    args.response.default = args.response.default === 'afterUpdate' ?
      'isUpdated' : args.response.default;
    if (args.response.default === 'afterError') return callback({ code: 404 });
    callback(null, args);
  }

};

export default new TestHook;

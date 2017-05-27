import { ArgTypes } from '../../src';
import TestDefault from '../utils/testDefault-test';

class TestBefore extends TestDefault {

  description = '- Before'

  config = {
    route: '/test/before',
    args: {
      default: ArgTypes.string,
    },
  }

  tests = [{
    name: 'Before basic test',
    args: {
      default: 'default',
    },
    validationFn: this.testSuccess,
  }, {
    name: 'Before must update data',
    args: {
      default: 'beforeUpdate',
    },
    validationFn: this.testSuccessUpdate,
  }, {
    name: 'Before must return error code 404',
    args: {
      default: 'beforeError',
    },
    validationFn: this.testError404,
  }];

  before(socket, args, next) {
    args.default = args.default === 'beforeUpdate' ? 'isUpdated' : args.default;
    if (args.default === 'beforeError')	return next({ code: 404 });
    next();
  }

};

export default new TestBefore;

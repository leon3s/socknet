import { assert } from 'chai';
import { ArgTypes } from '../../src';

export default class TestDefault {

  description = '- Default test'

  config = {
    route: 'test/default',
    args: {
      default: ArgTypes.string,
    },
  }

  tests = [{
    name: '- Default success',
    validationFn: this.testSuccess,
    args: {
      default: 'default',
    },
  }, {
    name: '- Default error 404',
    validationFn: this.testError404,
    args: {
      default: 'defaultError404',
    },
  }]

  on(socket, args, callback) {
    if (args.default === 'defaultError404') return callback({ code: 404 });
    callback(null, { code: 200, response: args });
  }

  testSuccessUpdate(err, data, done) {
    assert.equal(data.code, 200);
    assert.equal(data.response.default, 'isUpdated');
    done();
  }

  testSuccess(err, data, done) {
    assert.equal(data.code, 200);
    assert.equal(data.response.default, 'default');
    done();
  }

  testError401(err, done) {
    assert.equal(err.code, 401);
    done();
  }

  testError404(err, done) {
    assert.equal(err.code, 404);
    done();
  }
}

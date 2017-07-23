import { assert } from 'chai';
import { ArgTypes } from '../../src';

class TestTypes {

  description = '- Type validation'

  config = {
    return: true,
    route: '/test/types',
    args: {
      string: ArgTypes.string,
      integer: ArgTypes.integer.isRequired,
      array: ArgTypes.arrayOf(),
      object: ArgTypes.objectOf(),
    },
  }

  tests = [{
    name: 'Server should send success with code 200 if all arguments is valid',
    args: {
      string: '',
      integer: 300,
      array: ['toto'],
      object: { toto: 'tutu' },
    },
    validationFn: this.testSuccess,
  }];

  testTypes = {
    string: '',
    object: {},
    integer: 2020,
    array: [],
  };

  constructor() {
    Object.keys(this.testTypes).forEach((key) => {
      const testType = this.testTypes[key];

      this.tests.push({
        name:
          `Server should send error code 400 if general args is type ${key}`,
        args: {
          [`${key}`]: testType,
        },
        validationFn: this.testArgsTypes,
      });
    });

    const argKeys = Object.keys(this.config.args);

    argKeys.forEach((arg, index) => {
      Object.keys(this.testTypes).forEach((key) => {
        if (arg === key) return;

        const testType = this.testTypes[key];
        const validationFn = this.generateTestKeyError(arg);
        const test = {
          name: `Server should send error code 400 if ${arg} is type ${key}`,
          validationFn,
          args: {
            [`${arg}`]: testType,
          },
        };

        for (let i = 0; i < index; i++) {
          const argKey = argKeys[i];
          test.args[argKey] = this.testTypes[argKey];
        }
        this.tests.push(test);
      });
    });
  }

  testSuccess(err, data, done) {
    assert.equal(err, null);
    assert.equal(data.code, 200);
    done();
  }

  testArgsTypes(err, done) {
    assert.equal(err.code, 400);
    done();
  }

  generateTestKeyError(key) {
    return (err, done) => {
      assert.equal(err.code, 400);
      assert.equal(err.targetKey, key);
      done();
    };
  }

  on(socket, args, callback) {
    callback(null, { code: 200 });
  }

};

export default new TestTypes;

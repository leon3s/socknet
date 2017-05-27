import { assert } from 'chai';
import { ArgTypes } from '../../src';

import TestDefault from '../utils/testDefault-test';

class TestNamespace extends TestDefault {

	namespace = 'testNamespace'
	description = '- Namespace'

	config = {
		route: '/test/namespace/basic',
		args: {
			default: ArgTypes.string,
		},
	}

	tests = [{
		name: 'Server namespace basic tests',
		args: {
			default: 'default',
		},
		validationFn: this.testSuccess,
	}, {
		name: 'Server namespace return error',
		args: {
			default: 'error',
		},
		validationFn: this.testError404,
	}];

	serverEvent(socket, args, callback) {
		if (args.default === 'error') return callback({ code: 404 });
		callback(null, { code: 200, response: args });
	}

};

export default new TestNamespace;

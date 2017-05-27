import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import io from 'socket.io-client';

import TestServer, { config } from './utils/testServer-test';

const _ws = new TestServer();
const scenariosPath = path.join(__dirname, './scenarios');
const files = fs.readdirSync(scenariosPath);
const scenarioConfigs = [];
const localUrl = `http://localhost:${ config.port }`
const sockets = {
	default: io.connect(localUrl),
}

files.forEach((file) => {
	const scenario = require(path.join(scenariosPath, file)).default;
	scenarioConfigs.push(scenario);
	if (!scenario.namespace) {
		return _ws.add(scenario);
	}
	if (!_ws.namespaces[scenario.namespace]) {
		_ws.namespace(scenario.namespace);
		sockets[scenario.namespace] = io.connect(`${localUrl}/${scenario.namespace}`);
	}
	const namespace = _ws.namespaces[scenario.namespace];
	namespace.add(scenario);
});

describe(chalk.cyan('\n[ WSOCK TESTS ]'), function() {
	before(function(done) {
		_ws.start(() => {
			done();
		});
	});

	scenarioConfigs.forEach((scenarioConfig) => {
		describe('\n' + chalk.green(scenarioConfig.description), function() {
			scenarioConfig.tests.forEach((test) => {
				it(chalk.magenta(test.name), function(done) {
					const socket = scenarioConfig.namespace ?
						sockets[scenarioConfig.namespace] : sockets.default;
					socket.emit(scenarioConfig.config.route, test.args, (...args) => {
						test.validationFn(...args, done);
					});
				});
			});
		});
	});
});

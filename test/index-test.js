import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import io from 'socket.io-client';

import TestServer, { config } from './utils/testServer-test';

const _ws = new TestServer();

const scenarioConfigs = [];
const localUrl = `http://localhost:${ config.port }`;
const sockets = {};
const connections = {};

/** Import all file in scenarios */
const scenariosPath = path.join(__dirname, './scenarios');
const files = fs.readdirSync(scenariosPath);
files.forEach((file) => {
  const scenario = require(path.join(scenariosPath, file)).default;
  /** Push it in global config */
  scenarioConfigs.push(scenario);

  /** Test root namespace if scenario isnt a namespace test */
  if (!scenario.namespace) {
    /** Init root scenario */
    if (!connections.default)
      connections.default = { url: `${localUrl}`};
    if (scenario.sessionHeader) {
      connections.default.header = scenario.sessionHeader;
      _ws.session(scenario.session);
    }
    return _ws.add(scenario);
  }

  /** Init server namespace is no exist */
  if (!_ws.namespaces[scenario.namespace]) _ws.namespace(scenario.namespace);
  if (!connections[scenario.namespace]) connections[scenario.namespace] =
      { url: `${localUrl}/${scenario.namespace}`};

  const namespace = _ws.namespaces[scenario.namespace];

  if (scenario.sessionHeader) {
    connections[scenario.namespace].header = scenario.sessionHeader;
    namespace.session(scenario.session);
  }

  /** Init namespace scenario */
  namespace.add(scenario);

});

Object.keys(connections).forEach((key) => {
  const connection = connections[key];
  sockets[key] = io.connect(connection.url, connection.header);
});

function runScenario(scenarioConfig) {
  scenarioConfig.tests.forEach((test) => {
    it(chalk.magenta(test.name), function(done) {
      const socket = scenarioConfig.namespace ?
        sockets[scenarioConfig.namespace] : sockets.default;
      if (test.validationFn) {
        socket.emit(scenarioConfig.config.route, test.args, (...args) => {
          test.validationFn(...args, done);
        });
      } else if (test.validationListen) {
        test.validationListen(socket, done);
      }
    });
  });
}

describe(chalk.cyan('\n[ WSOCK TESTS ]'), function() {
  before(function(done) {
    _ws.start(() => {
      done();
    });
  });

  scenarioConfigs.forEach((scenarioConfig) => {
    describe('\n' + chalk.green(scenarioConfig.description), function() {
      runScenario(scenarioConfig);
    });
  });
});

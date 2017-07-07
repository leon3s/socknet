import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

import TestClient from './testClient-test';
import TestServer from './testServer-test';

/**
* @desc main class test for socknet
* @param {Object} config Test configuration
* @param {Number} config.port The port used for the test server
* @param {String} config.url The url for the client it will mostly be localhost
* @param {String} config.scenariosPath The scerarios scripts directory full path
*/
export default class Test {
  constructor({ url, port, scenariosPath }) {
    this.scenarios = [];
    this.uri = `${url}:${port}`;

    this.client = new TestClient();
    this.server = new TestServer({ port });
    this._loadServerScenario(scenariosPath);
  }

  /**
  * @private
  * @param {String} scenariosPath Scenarios directory
  * @desc Load scenario scripts from scenarios directory and
    configure client/server for tests
  */
  _loadServerScenario(scenariosPath) {
    const { connections } = this.client;
    const files = fs.readdirSync(scenariosPath);

    connections.default.uri = this.uri;
    files.forEach((file) => {
      const scenarioFilePath = path.join(scenariosPath, file);
      const scenario = require(scenarioFilePath).default;
      let namespace = this.server.namespaces[scenario.namespace];

      this.scenarios.push(scenario);
      if (!scenario.namespace) {
        if (scenario.sessionHeader) {
          this.server.session(scenario.session);
          connections.default.header = scenario.sessionHeader;
        }
        return this.server.add(scenario);
      }
      if (!connections[scenario.namespace])
        connections[scenario.namespace] = {};
      connections[scenario.namespace].uri = `${this.uri}/${scenario.namespace}`;
      if (!namespace) namespace = this.server.addNamespace(scenario.namespace);
      if (scenario.sessionHeader) {
        namespace.session(scenario.session);
        connections[scenario.namespace].header = scenario.sessionHeader;
      }
      namespace.add(scenario);
    });
  }

  /**
  * @desc run scenarios imported form scenarios directory
  */
  run() {
    this.client.setScenarioConfigs(this.scenarios);
    describe(chalk.cyan('\n[ SOCKNET TESTS ]'), () => {
      before((done) => this.server.start(() => done()));
      this.client.run();
    });
  }
}

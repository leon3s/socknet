import chalk from 'chalk';
import io from 'socket.io-client';

/**
* @desc Client class used for tests
*/
export default class TestClient {

  /**
  * @desc Global client sockets object referenced by namespace
  */
  sockets = {};
  /**
  * @desc Global client connections used for connect sockets
  */
  connections = {
    default: {},
  };

  /**
  * @private
  * @desc connect sockets based on connections
  // * @param {String} name The name of the connection i use the namespace name or default
  // * @param {Object} config Socket connection configuration object
  // * @param {String} config.uri The uri used for connect the client
  // * @param {Object} header The header used for the connection
  */
  _connectSockets() {
    Object.keys(this.connections).forEach((name) => {
      const { uri, header } = this.connections[name];

      this.sockets[name] = io.connect(uri, header || null);
    });
  }

  setScenarioConfigs(scenarioConfigs) {
    this.scenarioConfigs = scenarioConfigs;
  }

  _runScenario(scenarioConfig) {
    const socket = this.sockets[scenarioConfig.namespace]
      || this.sockets.default;
    scenarioConfig.tests.forEach((test) => {
      it(chalk.magenta(test.name), (done) => {
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

  /**
  * @desc Run client scenarios
  */
  run() {
    this._connectSockets();
    this.scenarioConfigs.forEach((scenarioConfig) => {
      describe('\n' + chalk.green(scenarioConfig.description), () => {
        this._runScenario(scenarioConfig);
      });
    });
  }
}

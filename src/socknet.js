import io from 'socket.io';

import Namespace from './namespace';

/**
* @class Socknet
* @extends {Namespace}
* @desc Socknet class for create server and manage namespaces
*/

export default class Socknet extends Namespace {

  /**
  * @typedef {Object} Socket
  * @property {?Object} session - Socket session null if unauthenticated
  * @property {function(route: String, callback: Function)} on - Socket listen on event
  * @property {function(route: String, data: [Object], callback: Function)} emit - Socket emit data
  */

  /**
  * @param {Object} config - Server configuration
  * @param {Http} config.http - Http instance for create the server
  * @param {Number} config.port - Port to bind the server
  */
  constructor({ http, port }) {
    super({ name: 'root' });

    /**
    * @type {Number}
    * @desc Server port
    */
    this.port = port;

    /**
    * @type {Http}
    * @desc Express or http instance
    */
    this.http = http;

    /**
    * @function listen start listening the server
    * @param {Number} port the server port
    * @param {Function} callback the callback when the server is ready
    */
    this.listen = http.listen;

    /**
    * @type {Io}
    * @desc Io instance from socket.io
    */
    this.io = io(http);

    /**
    * @see Namespace
    * @type {Namespace[]}
    * @desc Array of created namespace
    */
    this.namespaces = {};
  }

  /**
  * @desc Connect each socket to created events
  */
  _connectNamespace(namespace) {
    namespace.io.on('connection', (socket) => {
      socket.__e = {};
      socket.session = null;
      socket.connectEvents = namespace._bindSocket(socket);
      namespace._initEvents(socket);
      namespace._initSessionEvent(socket);
    });
  }

  /**
  * @param {String} name
  * @return {Namespace} - Return the created namespace
  * @desc Create new namespace for connect other application
  */
  createNamespace(name) {
    const namespace = this.namespaces[name] =
      new Namespace({name, io: this.io.of(name)});
    this._connectNamespace(namespace);
    return namespace;
  }

  /**
  * @param {Function} callback the callback when server is ready
  * @desc start server listening
  */
  listen(callback) {
    this._connectNamespace(this);
    this.http.listen(this.port, callback);
  }
}

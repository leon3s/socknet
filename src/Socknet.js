import io from 'socket.io';

import Namespace from './Namespace';

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
    * @desc Http instance
    */
    this.http = http;

    /**
    * @type {Io}
    * @desc Io instance from socket.io
    */
    this.io = io(http);

    /**
    * @see Namespace
    * @type {Namespace[]}
    * @desc Save of created namespaces
    */
    this.namespaces = {};
  }

  /**
  * @desc Connect each socket to created events
  */
  _connectNamespace = (namespace) => {
    namespace.io.on('connection', (socket) => {
      socket.session = null;
      socket.registeredEvents = {};
      socket.connectEvents = namespace.bindSocket(socket);
      namespace.initEvents(socket);
      namespace.initSessionEvent(socket);
    });
  }

  /**
  * @param {String} name
  * @return {Namespace} - Return the created namespace
  * @desc Create new namespace for connect other application
  */
  createNamespace = (name) => {
    this.namespaces[name] = new Namespace({ name, io: this.io.of(name) });
    this._connectNamespace(this.namespaces[name]);
    return this.namespaces[name];
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

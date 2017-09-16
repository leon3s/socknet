import ArgTypes from './ArgTypes';
import defaultLogger from './logger';

/**
* @class Namespace
* @extends {ArgTypes}
* @desc Namespace class used for manage events
*/
export default class Namespace extends ArgTypes {
  /**
  * @typedef {Object} Event
  * @property {Object} config - Event configuration
  * @property {String} config.route - Event route name
  * @property {Boolean} config.sessionRequired - Socket session
      if required for access to this Event
  * @property {Object} config.args - Definitions of the arguments required by
      the event inited with ArgTypes
  * @property {function(socket: Socket, args: Object, callback: Function)} before
      - The function call before the root
  * @desc Event definitions that is needed for create a route
  */

  /**
  * @param {Object} namespaceConfig - Namespace configuration object
  * @param {Io} namespaceConfig.io - Io instance
  * @param {String} namespaceConfig.name - Name of the namespace
  */
  constructor({ io, name }) {
    super();

    /**
    * @type {Io}
    * @desc Io instance
    */
    this.io = io;

    /**
    * @type {String}
    * @desc Name of the namespace
    */
    this.name = name;

    /**
    * @type {Event[]}
    * @desc Instance of all created events sorted by keyName
    */
    this.events = {};

    /**
    * @see loggers
    * @type {loggers[]}
    * @desc List of function call for query logs
    */
    this.loggers = [defaultLogger];
  }

  /**
  * @param {Socket} socket - new client connection
  * @param {Function} done - Call it once query to database for test cookie is done for exemple
  * @desc Default session validation is called each connect / reconnect of socket
      and argument are send on the url connection
      This can be override by calling session
  */
  _sessionValidationFn = (socket, done) => done();

  /**
  * @desc bind initEvent to socket so it can be used for login
  */
  bindSocket(socket) {
    return () => {
      this.initEvents(socket);
    };
  }

  _runLoggers(socket, event, ...args) {
    this.loggers.forEach(logger => logger(socket, event, ...args));
  }

  _loggers(socket, event, clientArgs) {
    if (!event.config.return) {
      this._runLoggers(socket, event);
      return;
    }
    const clientCallback = clientArgs[1];
    const newClientCallback = (...args) => {
      this._runLoggers(socket, event, ...args);
      clientCallback(...args);
    };
    clientArgs[1] = newClientCallback;
  }

  logger(logger) {
    this.loggers.push(logger);
  }

  /**
  * @param {Socket} socket - The socket to attach event
  * @desc Socket listen on all events with no required session
  * @todo Maybe it can be optimised
  */
  initEvents(socket) {
    Object.keys(this.events).forEach((key) => {
      const event = this.events[key];
      if (socket.registeredEvents[key]) return;
      if (event.config.requireSession && !socket.session) return;
      socket.registeredEvents[key] = event;
      socket.on(event.config.route, (...clientArgs) => {
        this._loggers(socket, event, clientArgs);
        this._core(socket, event, clientArgs);
      });
    });
  }

  /**
  * @param {Socket} socket - The socket concerned by the authentication
  * @param {?Function} callback - The callback on session validation is done
  * @desc Socket cookie validation that send default event __session__
  */
  initSessionEvent(socket, callback) {
    this._sessionValidationFn(socket, (err, session) => {
      socket.session = session || null;
      if (err) {
        if (callback) return callback(err);
        return socket.emit('__session__', err);
      }
      this.initEvents(socket);
      socket.emit('__session__', err, session);
      return typeof callback === 'function' ? callback() : null;
    });
  }

  /**
  * @param {Function} fnPtr - Function that valid the session at connection for current namespace
  * @desc You can only have one session validation by namespace
  */
  session(fnPtr) {
    this._sessionValidationFn = fnPtr;
  }

  /**
  * @param {String} route - The name of the route to hook
  * @param {Function} fnPtr - The function called before the hooked route
  * @desc Execute function before an existing route
    (You can have only one before by route)
  */
  before(route, fnPtr) {
    this.events[route].before = fnPtr;
  }

  /**
  * @param {Event} event - The function to call for this route
  * @desc Create basic event
  */
  on(event) {
    this.events[event.config.route] = event;
  }

  /**
  * @param {String} route - The name of the route to hook
  * @param {Function} fnPtr - The function called after the hooked route
  * @desc Execute function after an existing route (You can have only one after by route)
  */
  after(route, fnPtr) {
    this.events[route].after = fnPtr;
  }

  /**
  * @param {String} route - The name of the route to delete
  * @desc Delete route by route name
  */
  off(route) {
    delete this.events[route];
  }
}

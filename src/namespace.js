import CoreMiddleware from './coreMiddleware';

/**
* @desc
  Namespace class used for manage events
* @class Namespace
* @extends {CoreMiddleware}
*/
export default class Namespace extends CoreMiddleware {

  /**
  * @typedef {Object} Event
  * @property {Object} config - Event configuration
  * @property {String} config.route - Event route name
  * @property {Boolean} config.sessionRequired - Socket session if required for access to this Event
  * @property {Object} config.args - Definitions of the arguments required by the event inited with ArgTypes
  * @property {function(socket: Socket, args: Object, callback: Function)} before - The function call before the root
  * @desc Event definitions that is needed for create a route
  */

  /**
  * @param {Object} namespaceConfig - Namespace configuration object
  * @param {Io} namespaceConfig.io - Io instance
  * @param {String} namespaceConfig.name - Name of the namespace
  */
  constructor({io, name }) {
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
    * @type {Object}
    * @desc Instance of all created events sorted by keyName
    */
    this.events = {};
  }

  /**
  * @param {Socket} socket - The socket to attach event
  * @desc Socket listen on all events with no required session
  */
  _initEvents(socket) {
    Object.keys(this.events).map((key) => {
      const event = this.events[key];
      if (event.config.sessionRequired) return;
      socket.on(event.config.route, (...clientArgs) => {
        this.core(socket, event, clientArgs);
      });
    });
  }

  /**
  * @param {Socket} socket - The socket concerned by the authentication
  * @param {?Function} callback - The callback on session validation is done
  * @desc Socket cookie validation that send default event __session__
  */
  _initSessionEvent(socket, callback) {
    if (!this._sessionValidationFn) return;
    this._sessionValidationFn(socket, (err, session) => {
      if (err) {
        return socket.emit('__session__', err);
      }
      socket.session = session;
      socket.emit('__session__', err, session);
      if (callback) callback();
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
  * @param {String} fnPtr - The function to call for this route
  * @param {Object} config - The route configuration
  * @desc Create basic route
  */
  on(fnPtr, config) {
    this.events[config.route] = {
      fnPtr,
      config,
    };
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

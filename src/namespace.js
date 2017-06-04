import EventMiddleware from './eventMiddleware';

/**
* @class Namespace
* @extends {EventMiddleware}
* @desc Namespace class used for manage events
*/
export default class Namespace extends EventMiddleware {

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
    * @type {Event[]}
    * @desc Instance of all created events sorted by keyName
    */
    this.events = {};
  }

  _sessionValidationFn(socket, done) {
    done();
  }

  /**
  * @param {Socket} socket - The socket to attach event
  * @desc Socket listen on all events with no required session
  */
  _initEvents(socket) {
    Object.keys(this.events).map((key) => {
      const event = this.events[key];
      if (socket.__e[key]) return;
      if (event.config.requireSession && !socket.session) return;
      socket.__e[key] = event;
      socket.on(event.config.route, (...clientArgs) => {
        this._core(socket, event, clientArgs);
      });
    });
  }

  /**
  * @param {Socket} socket - The socket concerned by the authentication
  * @param {?Function} callback - The callback on session validation is done
  * @desc Socket cookie validation that send default event __session__
  */
  _initSessionEvent(socket, callback) {
    this._sessionValidationFn(socket, (err, session) => {
      socket.session = session || null;
      if (err) {
        if (callback) callback();
        return socket.emit('__session__', err);
      }
      this._initEvents(socket);
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

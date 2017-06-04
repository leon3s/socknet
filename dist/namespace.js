'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventMiddleware = require('./eventMiddleware');

var _eventMiddleware2 = _interopRequireDefault(_eventMiddleware);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
* @class Namespace
* @extends {EventMiddleware}
* @desc Namespace class used for manage events
*/
var Namespace = function (_EventMiddleware) {
  _inherits(Namespace, _EventMiddleware);

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
  function Namespace(_ref) {
    var io = _ref.io,
        name = _ref.name;

    _classCallCheck(this, Namespace);

    /**
    * @type {Io}
    * @desc Io instance
    */
    var _this = _possibleConstructorReturn(this, (Namespace.__proto__ || Object.getPrototypeOf(Namespace)).call(this));

    _this.io = io;

    /**
    * @type {String}
    * @desc Name of the namespace
    */
    _this.name = name;

    /**
    * @type {Event[]}
    * @desc Instance of all created events sorted by keyName
    */
    _this.events = {};
    return _this;
  }

  _createClass(Namespace, [{
    key: '_sessionValidationFn',
    value: function _sessionValidationFn(socket, done) {
      done();
    }

    /**
    * @param {Socket} socket - The socket to attach event
    * @desc Socket listen on all events with no required session
    */

  }, {
    key: '_initEvents',
    value: function _initEvents(socket) {
      var _this2 = this;

      Object.keys(this.events).map(function (key) {
        var event = _this2.events[key];
        if (socket.__e[key]) return;
        if (event.config.requireSession && !socket.session) return;
        socket.__e[key] = event;
        socket.on(event.config.route, function () {
          for (var _len = arguments.length, clientArgs = Array(_len), _key = 0; _key < _len; _key++) {
            clientArgs[_key] = arguments[_key];
          }

          _this2._core(socket, event, clientArgs);
        });
      });
    }

    /**
    * @param {Socket} socket - The socket concerned by the authentication
    * @param {?Function} callback - The callback on session validation is done
    * @desc Socket cookie validation that send default event __session__
    */

  }, {
    key: '_initSessionEvent',
    value: function _initSessionEvent(socket, callback) {
      var _this3 = this;

      this._sessionValidationFn(socket, function (err, session) {
        socket.session = session || null;
        if (err) {
          if (callback) callback();
          return socket.emit('__session__', err);
        }
        _this3._initEvents(socket);
        socket.emit('__session__', err, session);
        if (callback) callback();
      });
    }

    /**
    * @param {Function} fnPtr - Function that valid the session at connection for current namespace
    * @desc You can only have one session validation by namespace
    */

  }, {
    key: 'session',
    value: function session(fnPtr) {
      this._sessionValidationFn = fnPtr;
    }

    /**
    * @param {String} route - The name of the route to hook
    * @param {Function} fnPtr - The function called before the hooked route
    * @desc Execute function before an existing route
      (You can have only one before by route)
    */

  }, {
    key: 'before',
    value: function before(route, fnPtr) {
      this.events[route].before = fnPtr;
    }

    /**
    * @param {Event} event - The function to call for this route
    * @desc Create basic event
    */

  }, {
    key: 'on',
    value: function on(event) {
      this.events[event.config.route] = event;
    }

    /**
    * @param {String} route - The name of the route to hook
    * @param {Function} fnPtr - The function called after the hooked route
    * @desc Execute function after an existing route (You can have only one after by route)
    */

  }, {
    key: 'after',
    value: function after(route, fnPtr) {
      this.events[route].after = fnPtr;
    }

    /**
    * @param {String} route - The name of the route to delete
    * @desc Delete route by route name
    */

  }, {
    key: 'off',
    value: function off(route) {
      delete this.events[route];
    }
  }]);

  return Namespace;
}(_eventMiddleware2.default);

exports.default = Namespace;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _namespace = require('./namespace');

var _namespace2 = _interopRequireDefault(_namespace);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
* @class Socknet
* @extends {Namespace}
* @desc Socknet class for create server and manage namespaces
*/

var Socknet = function (_Namespace) {
  _inherits(Socknet, _Namespace);

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
  function Socknet(_ref) {
    var http = _ref.http,
        port = _ref.port;

    _classCallCheck(this, Socknet);

    /**
    * @type {Number}
    * @desc Server port
    */
    var _this = _possibleConstructorReturn(this, (Socknet.__proto__ || Object.getPrototypeOf(Socknet)).call(this, { name: 'root' }));

    _this.port = port;

    /**
    * @type {Http}
    * @desc Express or http instance
    */
    _this.http = http;

    /**
    * @type {Io}
    * @desc Io instance from socket.io
    */
    _this.io = (0, _socket2.default)(http);

    /**
    * @see Namespace
    * @type {Namespace[]}
    * @desc Array of created namespace
    */
    _this.namespaces = {};
    return _this;
  }

  /**
  * @desc Connect each socket to created events
  */


  _createClass(Socknet, [{
    key: '_connectNamespace',
    value: function _connectNamespace(namespace) {
      namespace.io.use(function (socket, next) {
        socket.__e = {};
        socket.session = null;
        namespace._initEvents(socket);
        namespace._initSessionEvent(socket, function () {
          next();
        });
      });
    }

    /**
    * @param {String} name
    * @return {Namespace} - Return the created namespace
    * @desc Create new namespace for connect other application
    */

  }, {
    key: 'createNamespace',
    value: function createNamespace(name) {
      var namespace = this.namespaces[name] = new _namespace2.default({ name: name, io: this.io.of(name) });
      this._connectNamespace(namespace);
      return namespace;
    }

    /**
    * @param {Function} callback
    * @desc Start function callback when server is ready
    */

  }, {
    key: 'start',
    value: function start() {
      this._connectNamespace(this);
    }
  }]);

  return Socknet;
}(_namespace2.default);

exports.default = Socknet;
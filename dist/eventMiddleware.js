'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _argTypes = require('./argTypes');

var _argTypes2 = _interopRequireDefault(_argTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
* @private CoreMiddleware
*/
var EventMiddleware = function () {
  function EventMiddleware() {
    _classCallCheck(this, EventMiddleware);
  }

  _createClass(EventMiddleware, [{
    key: '_core',
    value: function _core(socket, event, clientArgs) {
      var _this = this;

      if (!this.validateClientArgs(event, clientArgs)) return;

      this.socket = socket;
      var clientCallback = clientArgs[1];

      if (event.before) {
        return this._beforeEvent(event, clientArgs);
      }

      event.on(socket, clientArgs[0], function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var err = args[0];
        if (err) {
          return clientCallback(err);
        }
        if (event.after) {
          var argsWithouErr = args.splice(1, args.length);
          return _this._afterEvent(event, argsWithouErr, clientCallback);
        }
        clientCallback.apply(undefined, args);
      });
    }
  }, {
    key: '_beforeEvent',
    value: function _beforeEvent(event, clientArgs) {
      var _this2 = this;

      var requestArgs = clientArgs[0];
      var clientCallback = clientArgs[1];

      event.before(this.socket, requestArgs, function (err) {
        if (err) {
          /**
          * TODO
          * LOGGER ON ERROR
          */
          return clientCallback(err);
        }
        event.on(_this2.socket, requestArgs, function () {
          for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          var err = args[0];
          if (err) {
            /**
            * TODO
            * LOGGER ON ERROR
            */
            return clientCallback(err);
          }
          if (event.after) {
            var argsWithouErr = args.splice(1, args.length);
            return _this2._afterEvent(event, argsWithouErr, clientCallback);
          }
          clientCallback.apply(undefined, args);
        });
      });
    }
  }, {
    key: '_afterEvent',
    value: function _afterEvent(event, args, clientCallback) {
      event.after.apply(event, [this.socket].concat(_toConsumableArray(args), [function () {
        var err = arguments.length <= 0 ? undefined : arguments[0];
        if (err) {
          /**
          * TODO LOGGER
          **/
          return clientCallback(err);
        }
        clientCallback.apply(undefined, arguments);
      }]));
    }
  }, {
    key: 'validateClientArgs',
    value: function validateClientArgs(_ref, clientArgs) {
      var fnPtr = _ref.fnPtr,
          config = _ref.config;

      var requestIsValid = true;
      var requestArgs = clientArgs[0];
      var clientCallback = clientArgs[1];

      if (config.return && typeof clientArgs[1] !== 'function') {
        // call logger //
        console.error(chalk.red('Warning: request ' + config.route + ' is called without callback'));
        requestIsValid = false;
        return requestIsValid;
      }

      if (config.args && !_argTypes2.default.objectOf().validationFn(requestArgs)) {
        // console.error(chalk.red('Warning: request must be an object'));
        clientCallback({
          code: 400,
          message: 'Bad Request',
          info: 'Argument object can\'t be null'
        });
        requestIsValid = false;
        return requestIsValid;
      }

      if (clientArgs.length < 2) {
        // console.error(chalk.red('Warning: client argument length is not valide'));
        requestIsValid = false;
        return requestIsValid;
      }

      Object.keys(config.args).forEach(function (key) {
        var argConfig = config.args[key];
        if (!argConfig.validationFn(requestArgs[key])) {
          requestIsValid = false;
          clientCallback({
            code: 400,
            message: 'Bad request ' + key + ' must be ' + argConfig.errorMessage,
            targetKey: key
          });
        }
      });

      return requestIsValid;
    }
  }]);

  return EventMiddleware;
}();

exports.default = EventMiddleware;
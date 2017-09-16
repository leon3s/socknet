'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArgTypes = undefined;

var _ArgTypes = require('./ArgTypes');

Object.defineProperty(exports, 'ArgTypes', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_ArgTypes).default;
  }
});

var _Socknet = require('./Socknet');

var _Socknet2 = _interopRequireDefault(_Socknet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
* @private
*/
exports.default = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(_Socknet2.default, [null].concat(args)))();
};
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Socknet = require('./Socknet');

var _Socknet2 = _interopRequireDefault(_Socknet);

var _ArgTypes2 = require('./ArgTypes');

var _ArgTypes3 = _interopRequireDefault(_ArgTypes2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
* - SOCKNET -
* this file is used for export the library
*/
var socknet = function socknet() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(_Socknet2.default, [null].concat(args)))();
};

socknet.ArgTypes = _ArgTypes3.default;

/**
* @private
*/
exports.default = socknet;
module.exports = exports['default'];
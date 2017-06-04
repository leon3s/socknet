'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArgTypes = undefined;

exports.default = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(_socknet2.default, [null].concat(args)))();
};

var _socknet = require('./socknet');

var _socknet2 = _interopRequireDefault(_socknet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
* @private
*/
var ArgTypes = exports.ArgTypes = require('./argTypes').default;

/**
* @private
*/
/**
* - SOCKNET -
* this file is used for export the library
*/
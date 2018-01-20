(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './ArgTypes', './Socknet'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./ArgTypes'), require('./Socknet'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.ArgTypes, global.Socknet);
    global.index = mod.exports;
  }
})(this, function (exports, _ArgTypes, _Socknet) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ArgTypes = undefined;
  Object.defineProperty(exports, 'ArgTypes', {
    enumerable: true,
    get: function () {
      return _interopRequireDefault(_ArgTypes).default;
    }
  });

  var _Socknet2 = _interopRequireDefault(_Socknet);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  exports.default = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return new (Function.prototype.bind.apply(_Socknet2.default, [null].concat(args)))();
  };
});
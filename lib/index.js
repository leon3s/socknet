var joi = require('@hapi/joi');
var oldIo = require('socket.io');

function Socknet() {
    return oldIo.apply(null, Array.from(arguments));
}

/**
* Inject io.on('connection') event for callback modified socket
*/
function injectIo (on) {
    return function (name, fn) {
        on.call(
            this,
            name,
            name === 'connection' ?
                injectSocket(fn) : fn
        );
    };
}

/**
* Inject socket to add some capabilyties
*/
function injectSocket (fn) {
    return function (socket) {
        socket.on = injectSocketOn(socket.on);
        fn(socket);
    };
}

/**
* Inject default socket.on fonction to be abble to validate arguments
*/
function injectSocketOn (on) {
    return function(name, fn) {
        on.call(this, name, injectEvent(name, fn));
    };
}

/**
* Verify if fonction passed to socket.on has argTypes
* if argTypes is set and function arguments are valide then call server fonction
* else callback error
*/
function injectEvent(name, fn) {
    return function () {
        var argTypes = fn.argTypes;
        var args = Array.from(arguments);
        var callback = args[args.length - 1];
        if (!argTypes) return fn.apply(null, args);
        if (!(argTypes instanceof Array)) {
            return console.error('Alert argTypes is not an array for event ' + name);
        }
        if (!validateArgsSize(callback, args, argTypes)) return;
        if (!validateArgsSchema(callback, args, argTypes)) return;
        try {
            return fn.apply(null, args);
        } catch (e) {
            return console.error('Unexpected error while trying to execute ' + name, e);
        }
    };
}

/** Verify if event has good number of arguments */
function validateArgsSize(callback, args, argTypes) {
    var argsLength = args.length;
    var argTypesLength = argTypes.length;

    if (argsLength !== argTypesLength) {
        callbackError(callback, {
            code: 400,
            status: 400,
            statusCode: 400,
            message: 'arguments length not match expected ' + argTypesLength + ' got '  + argsLength,
        });
        return false;
    }
    return true;
}

/** Validate params incomming from client based on event schema */
function validateArgsSchema (callback, args, argTypes) {
    var i = -1;
    var error = null;
    while (++i < args.length) {
        error = joi.validate(args[i], argTypes[i]).error;
        if (error) break;
    }
    if (!error) return true;
    callbackError(callback, {
        code: 400,
        status: 400,
        message: error.details.map(function(detail) {
            return detail.message;
        }).join(' '),
        statusCode: 400,
    });
    return false;
}

/** Verify if callback exist and callback error */
function callbackError(callback, error) {
    if (joi.validate(callback, joi.func().required()).error) return;
    return callback(error);
}

Socknet.ArgTypes = joi;

/** socket.io overrides */
oldIo.ArgTypes = Socknet.ArgTypes;
oldIo.prototype.on = injectIo(oldIo.prototype.on);

module.exports = Socknet;

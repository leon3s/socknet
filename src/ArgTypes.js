import _ from 'lodash';

/**
* @class ArgTypes
* @desc Arguments type validation
*/
export default class ArgTypes {
  /**
  * @typedef {Object} ArgType
  * @property {String} errorMessage - The error message to return for identify error
  * @property {Function} validationFn - The function that validate the data type
  * @property {?Object|Array} data - The data definitions if object and array
  */

  /**
  * @type {ArgType}
  * @desc Integer validation
  */
  static integer = {
    name: 'integer',
    errorMessage: 'an integer',
    isRequired: {
      name: 'integer',
      errorMessage: 'an integer',
      validationFn: _.isInteger,
    },
    validationFn: data => (
      data === null || typeof data === 'undefined' ? true : _.isInteger(data)
    ),
  }

  /**
  * @type {ArgType}
  * @desc Integer validation
  */
  static string = {
    name: 'string',
    errorMessage: 'a string',
    isRequired: {
      name: 'string',
      errorMessage: 'a string',
      validationFn: data => (typeof data === 'string'),
    },
    validationFn: data => (
      data === null || typeof data === 'undefined' ?
        true : typeof data === 'string'
    ),
  }

  /**
  * @type {Function}
  * @param {?Object} definition - How the object should look like can be null
  * @desc Object validation
  * @return {ArgType}
  */
  static objectOf(definition) {
    return {
      definition,
      name: 'object',
      errorMessage: 'an object',
      isRequired: {
        definition,
        name: 'object',
        errorMessage: 'an object',
        validationFn: data => (!_.isArray(data) && typeof data === 'object'),
      },
      validationFn: data => (
        data === null || typeof data === 'undefined' ?
          true : !!(!_.isArray(data) && typeof data === 'object')
      ),
    };
  }

  /**
  * @type {Function}
  * @param {?Array} definition - How the array should look like can be null
  * @return {ArgType}
  * @desc Array validation
  */
  static arrayOf(definition) {
    return {
      definition,
      name: 'array',
      errorMessage: 'an array',
      isRequired: {
        definition,
        name: 'object',
        errorMessage: 'an object',
        validationFn: _.isArray,
      },
      validationFn: data => (
        data === null || typeof data === 'undefined' ?
          true : !!_.isArray(data)
      ),
    };
  }

  _core(socket, event, clientArgs) {
    if (!this.validateClientArgs(event, clientArgs)) return;

    this.socket = socket;
    const clientCallback = clientArgs[1];

    if (event.before) {
      this._beforeEvent(event, clientArgs);
      return;
    }

    event.on(socket, clientArgs[0], (...args) => {
      const err = args[0];
      if (err) {
        clientCallback(err);
        return;
      }
      if (event.after) {
        const argsWithouErr = args.splice(1, args.length);
        this._afterEvent(event, argsWithouErr, clientCallback);
        return;
      }
      clientCallback(...args);
    });
  }

  _beforeEvent(event, clientArgs) {
    const requestArgs = clientArgs[0];
    const clientCallback = clientArgs[1];

    event.before(this.socket, requestArgs, (err) => {
      if (err) {
        clientCallback(err);
        return;
      }
      event.on(this.socket, requestArgs, (...args) => {
        const err = args[0];
        if (err) {
          clientCallback(err);
          return;
        }
        if (event.after) {
          const argsWithouErr = args.splice(1, args.length);
          this._afterEvent(event, argsWithouErr, clientCallback);
          return;
        }
        clientCallback(...args);
      });
    });
  }

  _afterEvent(event, args, clientCallback) {
    event.after(this.socket, ...args, (...args) => {
      const err = args[0];
      if (err) {
        clientCallback(err);
        return;
      }
      clientCallback(...args);
    });
  }

  validateClientArgs = ({ config }, clientArgs) => {
    let requestIsValid = true;
    const requestArgs = clientArgs[0];
    const clientCallback = clientArgs[1];

    if (config.return && typeof clientArgs[1] !== 'function') {
      requestIsValid = false;
      return requestIsValid;
    }

    if (config.args && !ArgTypes.objectOf().validationFn(requestArgs)) {
      clientCallback({
        code: 400,
        message: 'Bad Request',
        info: 'Argument object can\'t be null',
      });
      requestIsValid = false;
      return requestIsValid;
    }

    if (clientArgs.length < 2) {
      requestIsValid = false;
      return requestIsValid;
    }

    if (!config.args) config.args = {};

    Object.keys(config.args).forEach((key) => {
      const argConfig = config.args[key];
      if (!argConfig.validationFn(requestArgs[key])) {
        requestIsValid = false;
        clientCallback({
          code: 400,
          message: `Bad request ${key} must be ${argConfig.errorMessage}`,
          targetKey: key,
        });
      }
    });

    return requestIsValid;
  }
}

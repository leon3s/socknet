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
    validationFn: (data) => (
      data === null || typeof data === undefined ? true : _.isInteger(data)
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
      validationFn: (data) => (typeof data === 'string'),
    },
    validationFn: (data) => (
      data === null || typeof data === undefined ?
        true : typeof data === 'string' ? true : false
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
        validationFn: (data) => (!_.isArray(data) && typeof data === 'object'),
      },
      validationFn: (data) => (
        data === null || typeof data === undefined ?
          true : !_.isArray(data) && typeof data === 'object' ? true : false
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
      validationFn: (data) => (
        data === null || typeof data === undefined ?
          true : _.isArray(data) ? true : false
      ),
    };
  }
}

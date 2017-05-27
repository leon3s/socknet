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
    errorMessage: 'an integer',
    validationFn: _.isInteger,
  }

	/**
	* @type {ArgType}
	* @desc Integer validation
	*/
  static string = {
    errorMessage: 'a string',
    validationFn: function(data) {
      return typeof data === 'string';
    },
  }

	/**
	* @type {Function}
	* @param {?Object} data - How the object should look like can be null
	* @desc Object validation
	* @return {ArgType}
	*/
  static objectOf(data) {
    return {
      errorMessage: 'an object',
      definition: data,
      validationFn: function(data) {
        return !_.isArray(data) && typeof data === 'object';
      }
    };
  }

	/**
	* @type {Function}
	* @param {?Array} data - How the array should look like can be null
	* @return {ArgType}
	* @desc Array validation
	*/
  static arrayOf(data) {
    return {
      errorMessage: 'an array',
      definition: data,
      validationFn: _.isArray,
    };
  }

}

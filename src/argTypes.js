import _ from 'lodash';

export default class ArgTypes {

	static integer = {
		errorMessage: 'an integer',
		validationFn: _.isInteger,
	}

	static string = {
		errorMessage: 'a string',
		validationFn: function(data) {
			return typeof data === 'string';
		},
	}

	static objectOf(data) {
		return {
			errorMessage: 'an object',
			definition: data,
			validationFn: function(data) {
				return !_.isArray(data) && typeof data === 'object';
			}
		}
	}

	static arrayOf(data) {
		return {
			errorMessage: 'an array',
			definition: data,
			validationFn: _.isArray,
		};
	}

}

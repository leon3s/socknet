/**
* - SOCKNET -
* this file is used for export the library
*/
import Socknet from './socknet';

/**
* @private
*/
export const ArgTypes = require('./argTypes').default;

/**
* @private
*/
export default function(...args) {
  return new Socknet(...args);
}

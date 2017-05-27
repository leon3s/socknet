/**
* - WSock -
* this file is used for export the library
*/
import WSock from './wSock';

/**
* @private
*/
export const ArgTypes = require('./argTypes').default;

/**
* @private
*/
export default function(...args) {
  return new WSock(...args);
}

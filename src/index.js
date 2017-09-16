/**
* - SOCKNET -
* this file is used for export the library
*/
import Socknet from './Socknet';

/**
* @private
*/
export { default as ArgTypes } from './ArgTypes';

/**
* @private
*/
export default (...args) => new Socknet(...args);

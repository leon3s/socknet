/**
* - SOCKNET -
* this file is used for export the library
*/
import Socknet from './Socknet';
import _ArgTypes from './ArgTypes';

const socknet = (...args) => new Socknet(...args);

socknet.ArgTypes = _ArgTypes;

/**
* @private
*/
export default socknet;

import chalk from 'chalk';
import io from 'socket.io';

import Namespace from './namespace';

/*
** @access my class
**
*/
class _ws extends Namespace {

	constructor({ http, port }) {
		super({ name: 'root' });
		this.port = port;
		this.http = http;
		this.io = io(http);
		this.namespaces = {};
	}

	createNamespace(name) {
		const namespace = this.namespaces[name] =
			new Namespace({name, io: this.io.of(name)});

		namespace.io.use((socket, next) => {
			namespace.initEvents(socket);
			namespace.initSessionEvent(socket, () => {
			});
			next();
		});
		return namespace;
	}

	_boot() {
		this.io.use((socket, next) => {
			this.initEvents(socket);
			this.initSessionEvent(socket, () => {
			});
			next();
		});
	}

	start(callback) {
		this._boot();
		this.http.listen(this.port, callback);
	}

}

export const ArgTypes = require('./argTypes').default;

export default function(...args) {
	return new _ws(...args);
}

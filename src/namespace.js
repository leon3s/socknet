import CoreMiddleware from './coreMiddleware';

export default class Namespace extends CoreMiddleware {

	constructor({ name, io }) {
		super();
		this.io = io;
		this.name = name;
		this.events = {};
	}

	initEvents(socket) {
		Object.keys(this.events).map((key) => {
			const event = this.events[key];
			if (event.config.session) return;
			socket.on(event.config.route, (...clientArgs) => {
				this.core(socket, event, clientArgs);
			});
		});
	}

	session(fnPtr) {
		this.sessionValidationFn = fnPtr;
	}

	initSessionEvent(socket, callback) {
		if (!this.sessionValidationFn) {
			return;
			// return console.error(chalk.red('Warning: no session validation is used for ' + this.name));
		}
		this.sessionValidationFn(socket, (err, session) => {
			if (err) {
				return socket.emit('__session__', err);
			}
			socket.session = session;
			socket.emit('__session__', err, session);
			callback();
		});
	}

	before(route, fnPtr) {
		this.events[route].before = fnPtr;
	}

	on(fnPtr, config) {
		this.events[config.route] = {
			fnPtr,
			config,
		};
	}

	after(route, fnPtr) {
		this.events[route].after = fnPtr;
	}

	off(route) {
		delete this.events[route];
	}

}

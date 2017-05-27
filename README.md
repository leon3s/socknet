# WSOCK

WSock is a websocket library base on socket.io
for precreate websocket event with argument validation hook (before and after)
and session validation

## Installation
```sh
npm install --save websock
```

## Usage
```js
import http from 'http';
import express from 'express';
import WSock, { ArgTypes } from '../../src';

export const config = {
	http: http.Server(express()),
	port: 9999,
}

const wsock = WSock(config);

class Event {
	static config = {
		return: true,
		route: '/aroute',
		args: {
			arg1: ArgTypes.string,
		},
	}

	constructor(socket, args. callback) {
		console.log(args.arg1); // your argument
		callback(null, { code: 200, response: { message: 'request done' }}); // your response
	}

}

const event = new Event();

wsock.on(event, event.config);

```

[socket-io]: https://socket.io

<div align="center">
<img
  width="160px"
  src="https://avatars3.githubusercontent.com/u/29265733?v=4&s=200">
</div>

<h1 align="center">Socknet</h1>

[![Build Status](https://travis-ci.org/leon3s/socknet.svg?branch=master)](https://travis-ci.org/leon3s/socknet)
[![Dependency Status](https://david-dm.org/leon3s/socknet.svg)](https://david-dm.org/leon3s/socknet.svg)
[![devDependency Status](https://david-dm.org/leon3s/socknet/dev-status.svg)](https://david-dm.org/leon3s/socknet#info=devDependencies)
[![NPM version](https://badge.fury.io/js/socknet.svg)](https://www.npmjs.com/package/socknet)
[![npm](https://img.shields.io/npm/dt/socknet.svg)]()

[![NPM](https://nodei.co/npm/socknet.png)](https://nodei.co/npm/socknet/)

## Overview
Socknet is a Nodejs library based on [socket.io][socket-io] for help you to hook events, validate arguments and create events that require authentication.
This is for server side only and it's fully compatible with [socket.io][socket-io] client.

## Quick start
```sh
npm install --save socknet
```

## Exemple
```js
import http from 'http';
import express from 'express';
import Socknet, { ArgTypes } from 'socknet';

const port = 1337;
const server = http.Server(express());

const socknet = Socknet({
  http: server,
  port,
});

class Event {
  config = {
    return: true,
    route: '/test',
    args: {
      arg1: ArgTypes.string, // the event callback an error if type if not a string null or undefined
    },
  }

  before(socket, args, next) {
    console.log('Im called before on !');
    args.addedByBefore = 'hello world';
    next();
  }

  on(socket, args, next) {
    console.log(args.arg1); // your argument
    // argument added by before hook
    console.log(args.addedByBefore); // -> show 'hello world'
    next(null, { code: 200, response: { message: 'request done' }}); // your response
  }

  after(socket, response, next) {
    // response is the data send by on callback
    console.log(response); // show -> { code: 200, response: { message: 'request done' }}
    next(null, 'new data'); // override response send by On
  }
}

// Bind event to socknet instance
socknet.on(new Event);

// Start listening
socknet.listen(() => console.log(`Server is listening on ${socknet.port}`));
```

## socknet api

##### on(Object)

Create event for the given config

```js
const event = {
  config: {
    return: true, // true if you need to return data
    route: '/test', // key use for register the event
    requireSession: false, // Client can't call this event if he is unregistered
    args: {
      arg1: ArgTypes.string, // Argument type
    },
  },
  on: (socket, args, callback) => {
    callback(null, { code: 200, response: { message: 'request done' }});
  },
};

socket.on(event);
```

##### off(String)
Delete event by route
```js
socknet.off('/test')
```

##### session(Function)
The session function for authentication
```js
socknet.session((socket, callback) => {
  const token = handshakeData._query['token'] || null;
  // DO DATABASE REQUEST
  // callback error user if unregistered so he can't access to private event
  // callback session the session will be bind to the socket
  callback(null, session);
});
```

##### listen(Callback)
Start server listening
```js
socknet.listen(() => console.log(`Server started on port ${socknet.port}`))
```

##### createNamespace(String)
Create new namespace
```js
const myNamespace = socknet.createNamespace('myNamespace');
```

##### namespaces
List of created namespaces as object you can access to your  namespace with the name
```js
const { myNamespace } = socknet.namespaces;
```

##### port
The port of the server

##### io
Socket.io instance

##### http
Http server instance

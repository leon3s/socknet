[socket-io]: https://socket.io

<div align="center">
<img
  width="160px"
  src="https://image.ibb.co/c11zDk/logo_leo.png">
</div>

<h1 align="center">Socknet</h1>

[![Build Status](https://travis-ci.org/leon3s/socknet.svg?branch=master)](https://travis-ci.org/leon3s/socknet)
[![Dependency Status](https://david-dm.org/leon3s/socknet.svg)](https://david-dm.org/leon3s/socknet.svg)
[![NPM version](https://badge.fury.io/js/socknet.svg)](https://www.npmjs.com/package/socknet)
[![npm](https://img.shields.io/npm/dt/socknet.svg)]()

[![NPM](https://nodei.co/npm/socknet.png)](https://nodei.co/npm/socknet/)

## Take a look at our get started and documentation on [socknet.io](http://socknet.io)

## Overview
socknet.io enables real-time bidirectional modular and secure event-based communication.

It&apos;s inspired by react component declaration style for event creation focusing on lisibility, modularity and security.
Fully compatible with socket.io client it works on every platform,
  browser or device, focusing equally on reliability, and speed.


## How to use

### Installing
```sh
$ npm install --save socknet
```

### Basic usage
server.js
```js
const socknet = require('socknet')(80);

socknet.on({
  config: {
    route: '/route',
    args: {},
  }
  on(socket, args, callback) {
    callback(null, 'hello world !')
  }
});

socknet.listen(() => console.log('socknet server is ready'));
```
client.js
```js
const socket = io();

socket.emit('/route', {}, function(err, data) {
  console.log('server response', data) // print 'hello world'
});
```

## Socknet api

##### on(Object)

On method create your event base on Object param it can contain the following attributes

```js
const myEvent = {
  // Event configuration
  config: {
    route: '/route', // Name of the event
    args: {}, // Argument of your event for payload verification with ArgTypes
    requireSession: false, // Socket must be authenticated for call this event
  }
  before(socket, args, next) {
    // hook if you want to modify payload before passing it to on method
  }
  on(socket, args, next) {
    // main function bind to event
  }
  after(socket, args, next) {
    // hook if you want to modify payload after on method
  }
};

socknet.on(myEvent);
```

##### session(Function)
Session method if you need authentication
```js
socknet.session((socket, callback) => {
  // DO DATABASE REQUEST
  // callback error user if unregistered so he can't access to private event
  // callback session the session will be bind to the socket
  callback(null, session);
});
```

##### listen(Callback)
Enable events added with on method
```js
socknet.listen(() => {
  console.log(`Server started on port ${port}`);
});
```

## ArgTypes

```js
const ArgTypes = require('socknet').ArgTypes

ArgTypes.integer // Arg must be a integer or null
ArgTypes.integer.isRequired // Arg must be a integer non null
ArgTypes.string // Arg must be a string or null
ArgTypes.string.isRequired // Arg must be a string non null
ArgTypes.objectOf() // Arg must be an object or null
ArgTypes.objectOf().isRequired // Arg must be an object non null
ArgTypes.arrayOf() // Arg must be an array or null
ArgTypes.arrayOf().isRequired // Arg must be an array non null
```

## Full exemple es6
```js
import Socknet, { ArgTypes } from 'socknet';

const port = process.env.PORT || 1337;

const socknet = Socknet(port);

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
socknet.listen(() => {
  console.log(`Server is listening on ${port}`)
});
```

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

<!-- ## Take a look at our get started and documentation on [socknet.io](http://socknet.io) -->

## Overview
Socknet hook any socket.io application for allow you to use joi validation schema before calling your all your events

It&apos;s inspired by react component declaration style for event creation focusing on lisibility, modularity and security.
Fully compatible with socket.io client it works on every platform,
  browser or device, focusing equally on reliability, and speed.

### How to use

## Installing
```sh
$ npm install --save socknet
```

### Basic usage
#### You can replace socknet by socket.io
server.js
```js
const socknet, { ArgTypes } = require('socknet')(80);

function testEvent(args, callback) {
  callback(null, args);
};

// To see all posibility refer to https://github.com/hapijs/joi/blob/v13.3.0/API.md
testEvent.argTypes = [
  ArgTypes.object({
    string: ArgTypes.string(),
  }),
  ArgTypes.func().isRequired(),
]

socknet.on('connection', (socket) => {
  socket.on('/test', testEvent);
});

socknet.listen(() => console.log('socknet server is ready'));
```
client.js
```js
const io = require('socket.io-client');
const socket = io();

socket.emit('/route', { string: 'Hello world' }, function(err, data) {
  console.log('server response', data) // print { string: HelloWorld }
});
```

#### Or you can just require socknet before socket.io it's will work too

server.js
```js
require('socknet');
const io = require('socket.io');
```

anyware.js
```js
const joi = require('joi');

function testEvent(args, callback) {
  callback(null, args);
};

// To see all posibility refer to https://github.com/hapijs/joi/blob/v13.3.0/API.md
testEvent.argTypes = [
  joi.object({
    string: joi.string(),
  }),
  joi.func().isRequired(),
]

io.on('connection', (socket) => {
  socket.on('/test', testEvent);
});

io.listen(() => console.log('socknet server is ready'));
```

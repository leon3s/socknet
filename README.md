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
Socknet hook any socket.io like library that allow you to use your favourite validation lib before calling your all your events.

It&apos;s inspired by react component declaration style for event creation focusing on lisibility, modularity and security.
Fully compatible with socket.io client it works on every platform,
  browser or device, focusing equally on reliability, and speed.

### How to use

## Installing
```sh
$ npm install --save socknet
```

## Parametes

`Socknet` constructor take an options object before all socket.io [Server](https://socket.io/docs/v4/server-api/) constructor parameters:

{
  schemas: schemas indexed by eventName,
  validate: a validation function which receive schema and data to validate. Must throw on error, could be async
}

## Examples
### Basic usage

server.js
```js
import { Socknet } from 'socknet';
import * as Joi from 'joi';


// Note that schema is an array of all args
const schema = Joi.array().ordened([
  Joi.object({
    data: Joi.string(),
  }),
  Joi.object({
    data2: Joi.string(),
  }),
])

const socknet = new Socknet({ schemas: { '/test': schema }, validate: (schema: Joi.AnySchema, data: unknown[]) => schema.validateAsync(data) }, httpServer)
const socknet.listen(PORT)

const testEvent = (...args: any[]) => {
  console.log('received and validated args', args);
}

socknet.on('connection', (socket) => {
  // event /test now have arguments protection
  socket.on('/test', testEvent);
});

```

client.js
```js
import { Socket } from 'socket.io-client';

Socket = io('http://localhost:' + PORT) as unknown as Socket;

Socket.emit('/test', { data: 'test' }, { data2: test2});
```

Server should log

```json
[{ "data": "test" }, { "data2": "test2" }]
```

Note that in this case invalid data will cause request is cancelled see below for error handling

### Response callback

server.js
```js
import { Socknet } from 'socknet';
import * as Joi from 'joi';


// Note that schema must contain callback function to allow it
const schema = Joi.array().ordened([
  Joi.string(),
  Joi.func()
])

const socknet = new Socknet({ schemas: { '/test': schema }, validate: (schema: Joi.AnySchema, data: unknown[]) => schema.validateAsync(data) }, httpServer)
const socknet.listen(PORT)

const testEvent = ((username, eventCallback) => {
    const error = doSomething();

    // Here whe handle both cases with callback or not but you could validate the function as `Joi.func().required()` and always have it
    if (eventCallback) {
        if (error) eventCallback(error)
        else eventCallback(null, username)
    }
})

socknet.on('connection', (socket) => {
  // event /test now have arguments protection
  socket.on('/test', testEvent);
});
```

client.js
```js
import { Socket } from 'socket.io-client';

Socket = io('http://localhost:' + PORT) as unknown as Socket;

Socket.emit('/test', 'someusername', function (error, response) {
  if (error) {
    // handle error
  } else {
    console.log(response);
  }
});
```

Client should log

```json
["someusername"]
```

### Ajv
```js

import { Socknet } from 'socknet';
import Ajv, { JSONSchemaType } from 'ajv';

import { Location } from '@/types';

const LocationSchema = {
  type: 'array',
  items: [
    {
      type: 'integer',
    },
    {
      type: 'integer',
    },
  ],
  minItems: 2,
  maxItems: 2,
} as JSONSchemaType<Location>;


export const ajv = new Ajv({
  schemas: {
    location: LocationSchema,
  },
});

const socknet = new Socknet(
  {
    schemas: {
      directions: 'location',
    },
    validate: (schema, data) => {
      try {
        console.log(ajv.validate(schema, data));
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
);

const socknet.listen(PORT)

const testEvent = ((longitude, latitude, eventCallback) => {
    const error = doSomething(longitude, latitude);

    // Here whe handle both cases with callback or not but you could validate the function as `Joi.func().required()` and always have it
    if (eventCallback) {
        if (error) eventCallback(error)
        else eventCallback(null, username)
    }
})

socknet.on('connection', (socket) => {
  // event /test now have arguments protection
  socket.on('/test', testEvent);
});
```



client.js
```js
import { Socket } from 'socket.io-client';

Socket = io('http://localhost:' + PORT) as unknown as Socket;

Socket.emit('/test', 1.184646, 50.123415);
```

# socknet

[![Build Status](https://travis-ci.org/leon3s/socknet.svg?branch=master)](https://travis-ci.org/leon3s/socknet)
[![Dependency Status](https://david-dm.org/leon3s/socknet.svg)](https://david-dm.org/leon3s/socknet.svg)
[![devDependency Status](https://david-dm.org/leon3s/socknet/dev-status.svg)](https://david-dm.org/leon3s/socknet#info=devDependencies)
[![NPM version](https://badge.fury.io/js/socknet.svg)](https://www.npmjs.com/package/socknet)

## Features
Socknet enable real-time bidirectional event-based communication with:
- Creation of private event that require session
- Clean and secure event configuration with arguments validation
- Management of multiples namespaces

## Installation
```sh
npm install --save socknet
```

## How to use (es6)
```js
import http from 'http';
import express from 'express';
import Socknet, { ArgTypes } from 'socknet';

const config = {
  http: http.Server(express()),
  port: 1337,
}

const socknet = Socknet(config);

class TestRoute {
  config = {
    return: true,
    route: '/test',
    args: {
      arg1: ArgTypes.string,
    },
  }

  before(socket, args, next) {
    console.log('Im called before on !');
    args.addedByBefore = 'hello world';
    next();
  }

  on(socket, args, callback) {
    console.log(args.arg1); // your argument
    // argument added by before hook
    console.log(args.addedByBefore); // -> show 'hello world'
    callback(null, { code: 200, response: { message: 'request done' }}); // your response
  }

  after(socket, response, callback) {
    // response is the data send by on callback
    console.log(response); // show -> { code: 200, response: { message: 'request done' }}
    callback(null, 'new data'); // override response send by On
  }

}

socknet.on(new TestRoute);

socknet.start();
config.http.listen(config.port, () => {
  console.log('server started !');
});

```

## Documentation
Please see the documentation [here](https://leon3s.github.io/socknet/docs). Contributions are welcome!

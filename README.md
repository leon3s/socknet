# SOCKNET

[![Build Status](https://travis-ci.org/leon3s/socknet.svg?branch=master)](https://travis-ci.org/leon3s/socknet)

Socknet is a websocket library based on socket.io
- [website](https://leon3s.github.io/socknet)
- [docs](https://leon3s.github.io/socknet/docs)

## What's in the box ?
Socknet give you:
- Clean and secure event configuration with arguments validation
- Creation of private event that require session
- Manage multiples namespaces

## Installation
```sh
npm install --save socknet
```

## Es6 exemple
```js
import http from 'http';
import express from 'express';
import Socknet, { ArgTypes } from 'socknet';

const config = {
  http: http.Server(express()),
  port: 9999,
}

const socknet = Socknet(config);

class Test {
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

socknet.on(new Test);

socknet.start(() => {
  console.log(`Server has been started on port:${config.port}`);
});

```

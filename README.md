# WSOCK

WSock is a websocket library base on socket.io\n
for precreate websocket event with argument validation hook (before and after)
and session validation

## Installation
```sh
npm install --save wsock
```

## Es6 exemple
```js
import http from 'http';
import express from 'express';
import WSock, { ArgTypes } from 'wsock';

export const config = {
  http: http.Server(express()),
  port: 9999,
}

const wsock = WSock(config);

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

wsock.on(new Test);

wsock.start(() => {
  console.log(`Server has been started on port:${config.port}`);
});

```

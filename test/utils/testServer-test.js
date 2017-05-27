import http from 'http';
import express from 'express';

import Socknet from '../../src';

export const config = {
  http: http.Server(express()),
  port: 9999,
};

const socknet = Socknet(config);

class Events {
  constructor(socknet) {
    this.socknet = socknet;
  }

  add(event) {
    this.socknet.on(event);
  }

  session(fnPtr) {
    this.socknet.session(fnPtr);
  }
}

export class TestNamespace extends Events {
  constructor(name) {
    const namespace = socknet.createNamespace(name);
    super(namespace);
  }
}

export default class TestServer extends Events {
  constructor() {
    super(socknet);
    this.namespaces = {};
  }

  namespace(name) {
    this.namespaces[name] = new TestNamespace(name);
    return new TestNamespace(name);
  }

  start(callback) {
    socknet.start(callback);
  }
}

import Socknet from 'socknet';

class Events {
  add(event) {
    this.namespace.on(event);
  }

  session(fnPtr) {
    this.namespace.session(fnPtr);
  }
}

class TestNamespace extends Events {
  constructor(name, socknet) {
    super();
    this.namespace = socknet.createNamespace(name);
  }
}

export default class TestServer extends Events {
  constructor(config) {
    super();
    this.namespaces = {};
    this.config = config;
    this.namespace = Socknet(config);
  }

  addNamespace(name) {
    return this.namespaces[name] = new TestNamespace(name, this.namespace);
  }

  start(callback) {
    this.namespace.listen(callback);
  }
}

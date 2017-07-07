import { ArgTypes } from '../../src';
import TestDefault from '../utils/testDefault-test';

class TestSession extends TestDefault {

  description = '- Session'
  namespace = 'sessionNamespace'

  sessionHeader = {
    query: 'token=TestToken!&userId=TestUserId',
  }

  config = {
    return: true,
    sessionRequired: true,
    route: '/event/registered',
    args: {
      default: ArgTypes.string,
    },
  }

  tests = [{
    name: 'Session callback',
    args: {},
    validationListen: this.validationListen,
  }, {
    name: 'Session test',
    args: {
      default: 'default',
    },
    validationFn: this.testSuccess,
  }, {
    name: 'Session with error',
    args: {
      default: 'error',
    },
    validationFn: this.testError401,
  }];

  session(socket, done) {
    console.log('SESSION IS CALL');
    const handshakeData = socket.request;
    const token = handshakeData._query['token'] || null;
    const userId = handshakeData._query['userId'] || null;

    console.log(handshakeData._query);
    if (!token && !userId)
      return done({ code: 401 });
    done(null, { username: '##' });
  }

  on(socket, args, callback) {
    if (socket.session && args.default === 'error')
      return callback({ code: '401' });
    if (socket.session) return callback(null, { code: 200, response: args });
    callback({ code: 404 });
  }

  validationListen(socket, done) {
    socket.on('__session__', console.log);
  }
};

export default new TestSession;

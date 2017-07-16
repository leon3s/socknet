import { ArgTypes } from '../../src';
import TestDefault from '../utils/testDefault-test';

class TestSession extends TestDefault {

  description = '- Session'
  namespace = 'sessionNamespace'

  sessionHeader = {
    query: {
      token: 'TestToken',
      userId: 'toto',
    },
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
    const { token, userId } = socket.handshake.query;

    console.log(token, userId);

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
    socket.on('__session__', () => {
      done();
    });
  }
};

export default new TestSession;

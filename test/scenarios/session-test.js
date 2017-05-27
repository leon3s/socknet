import { ArgTypes } from '../../src';
import TestDefault from '../utils/testDefault-test';

class TestSession extends TestDefault {

  description = '- Session'

  sessionHeader = {
    query: 'token=TestToken!&userId=TestUserId',
  }

  config = {
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
    const handshakeData = socket.request;
    const token = handshakeData._query['token'] || null;
    const userId = handshakeData._query['userId'] || null;

    if (!token && !userId)
      return done({ code: 401 });
    done(null, { username: '##' });
  }

  return(socket, args, callback) {
    if (socket.session && args.default === 'error')
      return callback({ code: '401' });
    if (socket.session) return callback(null, { code: 200, response: args });
    callback({ code: 404 });
  }
};

export default new TestSession;

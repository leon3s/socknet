import * as Joi from 'joi';
import { notStrictEqual, equal, deepEqual } from 'assert';
import { io } from 'socket.io-client';
import { Socket } from 'socket.io';
import * as source from '../src/index';
import * as build from '../lib/index';

const socknet = process.env.IS_CI === 'true' ? build : source;

const PORT = 1337 || process.env.TEST_PORT;

const argTypes = Joi.array()
  .ordered(
    Joi.object({
      username: Joi.string(),
      password: Joi.string(),
    }).required(),
    Joi.func().required(),
  )
  .length(2);

const onCallback = (...args: unknown[]) => {
  const callback = args.pop();

  return (callback as (err: null, data: unknown[]) => void)(null, args);
};

describe('[ TEST ] Socknet', () => {
  let clientSocket: Socket;
  const server = new socknet.Socknet({
    schemas: { '/test': argTypes },
    validate: (schema: Joi.AnySchema, data: unknown[]) =>
      schema.validateAsync(data),
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  beforeAll(done => {
    server.listen(PORT);

    server.on('connection', (socket: Socket) => {
      notStrictEqual(socket, null);
      socket.on('/test', onCallback);
      done();
    });

    clientSocket = io(`http://localhost:${PORT}`) as unknown as Socket;
  });

  it('Should call /test and get error arguments length not match width 3 arguments', done => {
    clientSocket.emit(
      '/test',
      {},
      'toto',
      (error: Joi.ValidationError, response: unknown) => {
        try {
          equal(response, null);
          equal(error.details[0].message, '"[1]" must be of type function');

          done();
        } catch (error_) {
          done(error_);
        }
      },
    );
  });

  it('Should get same data as response on calling /test', done => {
    clientSocket.emit(
      '/test',
      { username: 'a' },
      (error: Joi.ValidationError, response: unknown) => {
        try {
          equal(error, null);
          deepEqual(response, [{ username: 'a' }]);
          done();
        } catch (error_) {
          done(error_);
        }
      },
    );
  });

  it('Should call /test and get error arguments length not match width 1 arguments', done => {
    clientSocket.emit(
      '/test',
      (error: Joi.ValidationError, response: unknown) => {
        try {
          equal(response, null);
          equal(error.details[0].message, '"[0]" must be of type object');
          done();
        } catch (error_) {
          done(error_);
        }
      },
    );
  });

  it('Should call /test and get error throwed in callback', done => {
    clientSocket.emit('/test', (error: Joi.ValidationError) => {
      try {
        equal(error.details[0].message, '"[0]" must be of type object');
        done();
      } catch (error_) {
        done(error_);
      }
    });
  });

  it('Should call /test and get async error throwed in callback', done => {
    clientSocket.emit('/test', (error: Joi.ValidationError) => {
      try {
        equal(error.details[0].message, '"[0]" must be of type object');
        done();
      } catch (error_) {
        done(error_);
      }
    });
  });

  it('Should get same data as response on calling /test with async callback', done => {
    const data = { username: 'a' };
    clientSocket.emit(
      '/test',
      data,
      (error: Joi.ValidationError, response: unknown) => {
        try {
          equal(error, null);
          deepEqual(response, [data]);
          done();
        } catch (error_) {
          done(error_);
        }
      },
    );
  });

  it('Should call /test without arguments and not crash', done => {
    clientSocket.emit('/test');
    setTimeout(() => {
      try {
        equal(clientSocket.connected, true);
        done();
      } catch (error) {
        done(error);
      }
    }, 20);
  });

  it('Should get an error on calling with wrong object definition /test', done => {
    clientSocket.emit(
      '/test',
      {
        anyData: 'not allowed',
      },
      (error: Joi.ValidationError, response: unknown) => {
        try {
          equal(response, null);
          equal(error.details[0].message, '"[0].anyData" is not allowed');
          done();
        } catch (error_) {
          done(error_);
        }
      },
    );
  });

  it('Should get disconnect event if server close correctly', done => {
    server.close();
    clientSocket.on('disconnect', err => {
      try {
        equal(err, 'transport close');
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  afterAll(() => {
    clientSocket.disconnect();
  });
});

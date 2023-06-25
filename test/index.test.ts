import * as Joi from 'joi';
import { Server as HttpServer } from 'http';
import {
    notStrictEqual,
    equal,
    deepEqual,
} from 'assert'
import { io } from 'socket.io-client'
import * as source from '../src/index'
import type { EventCallback, Socknet, InjectedSocket } from '../src/index'
import * as build from '../lib/index'
import { Socket } from 'socket.io';

const socknet = process.env.IS_CI === 'true' ? build : source

const PORT = 1337 || process.env.TEST_PORT;

const argTypes = Joi.array().ordered(
    Joi.object({
        username: Joi.string(),
        password: Joi.string(),
    }).required(),
    Joi.func().required(),
).length(2);

const onCallback = ((...args: any[]) => {
    const callback = args.pop();

    return callback(null, args)
}) as any

describe('[ TEST ] Socknet', function () {
    let server: Socknet<Joi.AnySchema>;
    let clientSocket: Socket;
    let httpServer: HttpServer;
    beforeEach(() => {
        jest.resetAllMocks();
    })

    beforeAll((done) => {
        server = new (socknet.Socknet as any)({ schemas: { '/test': argTypes }, validate: (schema: Joi.AnySchema, data: unknown[]) => schema.validateAsync(data) }, httpServer)
        server.listen(PORT)

        server.on('connection', function (socket: InjectedSocket<any, any>) {
            notStrictEqual(socket, null);
            socket.on('/test', onCallback as (...args: any[]) => void | Promise<void>);
            done();
        });

        clientSocket = io('http://localhost:' + PORT) as unknown as Socket;
    })


    it('Should call /test and get error arguments length not match width 3 arguments', function (done) {

        clientSocket.emit('/test', {}, 'toto', function (error, response) {
            try {
                equal(response, null);
                equal(error.details[0].message, '"[1]" must be of type function');

                done();
            } catch (e) { done(e) }
        } as EventCallback<any[], Joi.ValidationError>);
    });

    it('Should get same data as response on calling /test', function (done) {
        clientSocket.emit('/test', { username: 'a' }, function (error, response) {
            try {
                equal(error, null);
                deepEqual(response, [{ username: 'a' }]);
                done();
            } catch (e) { done(e) }
        } as EventCallback<any[], Joi.ValidationError>);
    });

    it('Should call /test and get error arguments length not match width 1 arguments', function (done) {
        clientSocket.emit('/test', function (error, response) {
            try {
                equal(response, null);
                equal(error.details[0].message, '"[0]" must be of type object');
                done();
            } catch (e) { done(e) }
        } as EventCallback<any[], Joi.ValidationError>);
    });

    it('Should call /test and get error throwed in callback', function (done) {
        const err = new Error();

        clientSocket.emit('/test', function (error, response) {
            try {
                equal(error.details[0].message, '"[0]" must be of type object');
                done();
            } catch (e) { done(e) }
        } as EventCallback<any[], Joi.ValidationError>);
    });

    it('Should call /test and get async error throwed in callback', function (done) {
        const err = new Error();

        clientSocket.emit('/test', function (error, response) {
            try {
                equal(error.details[0].message, '"[0]" must be of type object');
                done();
            } catch (e) { done(e) }
        } as EventCallback<any[], Joi.ValidationError>);
    });

    it('Should get same data as response on calling /test with async callback', function (done) {
        const result = { a: 1 }

        const data = { username: 'a' };
        clientSocket.emit('/test', data, function (error, response) {
            try {
                equal(error, null);
                deepEqual(response, [data]);
                done();
            } catch (e) { done(e) }
        } as EventCallback<any[], Joi.ValidationError>);
    });

    it('Should call /test without arguments and not crash', function (done) {
        clientSocket.emit('/test');
        setTimeout(function () {
            try {
                equal(clientSocket.connected, true);
                done();
            } catch (e) { done(e) }
        }, 20);
    });

    it('Should get an error on calling with wrong object definition /test', function (done) {
        clientSocket.emit('/test', {
            anyData: 'not allowed',
        }, function (error, response) {
            try {
                equal(response, null);
                equal(error.details[0].message, '"[0].anyData" is not allowed');
                done();
            } catch (e) { done(e) }
        } as EventCallback<any[], Joi.ValidationError>);
    });

    it('Should get disconnect event if server close correctly', function (done) {
        server.close();
        clientSocket.on('disconnect', function (err) {
            try {
                equal(err, 'transport close');
                done();
            } catch (e) { done(e) }
        });
    });

    afterAll(function () {
        clientSocket.disconnect();
    });
});

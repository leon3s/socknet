var ArgTypes = require('joi');
var assert = require('assert');
var io = require('socket.io-client');

require('../lib/index');
var socknet = require('socket.io');

var PORT = 1337 || process.env.TEST_PORT;
var TIMEOUT = 1000 || process.env.TEST_TIMEOUT;

var server = null;
var clientSocket = null;

var argTypes = [
    ArgTypes.object({
        username: ArgTypes.string(),
        password: ArgTypes.string(),
    }),
    ArgTypes.func().required(),
];

function Test(args, callback) {
    callback(null, args);
}

Test.argTypes = argTypes;

describe('[ TEST ] Socknet', function() {
    it('Should have server listening on ' + PORT, function(done) {
        server = socknet();
        assert.notStrictEqual(server, null);
        server.listen(PORT);
        done();
    });
    it('Should be able to use socket.io-client', function(done) {
        server.on('connection', function(socket) {
            assert.notStrictEqual(socket, null);
            socket.on('/test', Test);
            done();
        });
        clientSocket = io.connect('http://localhost:' + PORT);
    });
    it('Should call /test and get error arguments length not match width 3 arguments', function(done) {
        clientSocket.emit('/test', {}, 'toto', function(error, response) {
            assert.equal(error.code, 400);
            assert.equal(response, null);
            assert.equal(error.message, 'arguments length not match expected 2 got 3');
            done();
        });
    });
    it('Should get same data as response on calling /test', function(done) {
        clientSocket.emit('/test', {}, function(error, response) {
            assert.equal(error, null);
            assert.deepEqual(response, {});
            done();
        });
    });
    it('Should call /test and get error arguments length not match width 1 arguments', function(done) {
        clientSocket.emit('/test', function(error, response) {
            assert.equal(error.code, 400);
            assert.equal(response, null);
            assert.equal(error.message, 'arguments length not match expected 2 got 1');
            done();
        });
    });
    it('Should call /test without arguments and not crash', function(done) {
        clientSocket.emit('/test');
        setTimeout(function() {
            assert.equal(clientSocket.connected, true);
            done();
        }, 20);
    });
    it('Should get an error on calling with wrong object definition /test', function(done) {
        clientSocket.emit('/test', {
            anyData: 'not allowed',
        }, function(error, response) {
            assert.equal(response, null);
            assert.deepEqual(error, {
                code: 400,
                status: 400,
                message: '"anyData" is not allowed',
                statusCode: 400,
            });
            done();
        });
    });
    it('Should get disconnect event if server close correctly', function(done) {
        server.close();
        clientSocket.on('disconnect', function(err) {
            assert.equal(err, 'transport close');
            done();
        });
    });
    afterAll(function() {
        clientSocket.close();
        server.close();
    });
});

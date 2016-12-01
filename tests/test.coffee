print = require '../sources/lib/print'
socket = require('socket.io-client')('http://localhost:1337')

responsePrint = ->
	responseArray = Array.from arguments
	for arg, index in responseArray
		print.error arg if index is 0
		print arg if typeof arg isnt 'undefined' and index > 0

socket.on 'connect', ->
	print.success 'Test starting'

	print 'starting auth test'
	socket.emit 'login',
		password: 'toto'
		nickname: 'toto'
	, responsePrint

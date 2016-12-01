print = require '../sources/lib/print'
socket = require('socket.io-client')('http://localhost:1337')

responsePrint = ->
	responseArray = Array.from arguments
	print.success 'Server response -> '
	print responseArray

socket.on 'connect', ->
	print.success 'Test starting'

	print.error 'test ->', ' login'
	socket.emit 'login',
		memberId: 'xoxo'
		token: 'xoxo'
	, (err, credentials) ->
		console.log err, credentials
	#
	# socket.emit 'member::join', ->
	# 	console.log 'test'

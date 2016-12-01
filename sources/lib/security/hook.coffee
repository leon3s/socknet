secureArgs = require './arguments'

errors = (code) ->
	errorsCode =
		401:
			statusCode: 401
			error: 'Unautorized'
		404:
			statusCode: 404
			error: 'Not found'
	return errorsCode[code]

secureHook = (socknet, socket, event, socketArgs) ->
	authenticatedCallback = arguments[4]
	clientCallback = socketArgs[ event.rules.args.length ]
	socketArgs.splice event.rules.args.length, 1

	callbackError = (err) ->
		if typeof clientCallback is 'function'
			if typeof err is 'number'
				return clientCallback errors err
			return clientCallback err

	afterEventCallback = (err) ->
		if typeof authenticatedCallback is 'function' and !err
			return authenticatedCallback.apply null, [socket, arguments, clientCallback]
		clientCallback.apply null, arguments

	beforeEventNext = (err, args) ->
		return unless Array.isArray args
		return callbackError err if err
		afterEvent = socknet.hooks.after[ event.rules.name ]
		if typeof afterEvent is 'function'
		then args.push beforeAfterEventNext
		else args.push afterEventCallback
		args.unshift socket
		event.fn.apply null, args


	beforeAfterEventNext = (err) ->
		return callbackError err if err
		args = []
		for arg in arguments
			if arg isnt err
			then args.push arg
		afterArgs = [socket, args, afterEventCallback]
		socknet.hooks.after[ event.rules.name ].apply null, afterArgs

	unless args = secureArgs socketArgs, event.rules
		return callbackError 401

	beforeEvent = socknet.hooks.before[ event.rules.name ]
	if typeof beforeEvent is 'function'
		beforeArgs = [socket, socketArgs, beforeEventNext]
		beforeEvent.apply null, beforeArgs
		return

	socketArgs.unshift socket
	afterEvent = socknet.hooks.after[ event.rules.name ]
	if typeof afterEvent is 'function'
		socketArgs.push beforeAfterEventNext
		event.fn.apply null, socketArgs
		return

	socketArgs.push afterEventCallback
	event.fn.apply null, socketArgs

module.exports = secureHook

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
		clientCallback = socketArgs[0]
		if event.rules.args and typeof clientCallback isnt 'function'
			clientCallback = socketArgs[ event.rules.args.length ]
		return callbackError 401

	if event.rules.args
		clientCallback = args[event.rules.args.length]
		args.splice event.rules.args.length, 1
	else if event.rules.return
		clientCallback = args[0]
		args.splice 0, 1

	beforeEvent = socknet.hooks.before[ event.rules.name ]
	if typeof beforeEvent is 'function'
		beforeArgs = [socket, args, beforeEventNext]
		beforeEvent.apply null, beforeArgs
		return

	args.unshift socket
	afterEvent = socknet.hooks.after[ event.rules.name ]
	if typeof afterEvent is 'function'
		args.push beforeAfterEventNext
		event.fn.apply null, args
		return

	args.push afterEventCallback
	event.fn.apply null, args

module.exports = secureHook

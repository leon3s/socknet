secureArgs = require './security/arguments'
secureHook = require './security/hook'

###
# Attach events function to socknet object
#	@param {object} socknet The socknet object
###
socknetEvents = (socknet) ->

	startEvent = (socket, event) ->
		socket.on event.rules.name, ->
			socketArgs = Array.from arguments
			secureHook socknet, socket, event, socketArgs

	startPublicEvents = (socket) ->
		for event in socknet.events.public
			startEvent socket, event

	startPrivateEvents = (socket, args, clientCallback) ->
		for event in socknet.events.private
			startEvent socket, event
		for observe in socknet.observe.auth
			observe.apply null, [socket]
		if typeof clientCallback is 'function'
			clientCallback.apply null, args

	startAuth = (socket, event) ->
		socket.on event.rules.name, ->
			socketArgs = Array.from arguments
			secureHook socknet, socket, event, socketArgs, startPrivateEvents

	startAuthEvents = (socket) ->
		for autheMethod in socknet.authMethods
			startAuth socket, autheMethod

	socknetEvents.connectSocket = (socket) ->
		startAuthEvents socket
		startPublicEvents socket

	return socknetEvents

module.exports = socknetEvents

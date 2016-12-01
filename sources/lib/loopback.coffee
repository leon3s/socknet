module.exports = (socknet, app) ->

	socknet.enableLoopback = ->
		socknet.models = app.models

module.exports = (socknet, app) ->

	socknet.enableLoopback = ->
		socknet.models = app.models
		for key, model of socknet.models
			console.log key

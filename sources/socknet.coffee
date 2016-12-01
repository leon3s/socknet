##               _               _
##  ___ ___  __ | |__ _ _   ___ | |_
## (_-</ _ \/ _|| / /| ' \ / -_)|  _|
## /__/\___/\__||_\_\|_||_|\___| \__|
## 		A websocket library
##
## author: leon3s
##

io = require 'socket.io'
path = require 'path'
fs = require 'fs'

socknetEvents = require './lib/events'
socknetLoopback = require './lib/loopback'
socknetLoadFiles = require './lib/load-files'

socknet = module.exports = (app) ->

	###
	# List of events created
	# @memberOf socknet
	# @property events
	# @type object
	###
	socknet.events =
		public: []
		private: []

	###
	#	List of hooks created
	# @memberOf socknet
	# @property hooks
	# @type object
	###
	socknet.hooks =
		before: {}
		after: {}
		afterError: {}

	###
	# Array of authMethods
	# @memberOf socknet
	# @property events
	# @type array
	###
	socknet.authMethods = []

	###
	# @memberOf socknet
	# @property on
	# @type function
	# @param {object} rules event rules
	# @param {function} fn function to attach to even
	###
	socknet.on = (fn, rules) ->
		type = 'public'
		if rules.auth is true
			type = 'private'
		socknet.events[type].push
			fn: fn
			rules: rules

	###
	# Add auth method
	# @memberOf socknet
	# @property auth
	# @type function
	# @param {object} rules authMethods rules
	# @param {function} function to attach to authMethods
	###
	socknet.auth = (fn, rules) ->
		rules.return = true
		socknet.authMethods.push
			fn: fn
			rules: rules

	socknet.before = (eventName, fn) ->
		socknet.hooks.before[eventName] = fn

	socknet.after = (eventName, fn) ->
		socknet.hooks.after[eventName] = fn

	socknet.afterError = (eventName, fn) ->
		# not work for now :)
		socknet.hooks.afterError[eventName] = fn

	socknet.connect = ->
		socknet.io = io app.start()
		socknet.io.sockets.on 'connection', socknetEvents.connectSocket

	socknetEvents socknet
	socknetLoadFiles socknet
	socknetLoopback socknet, app


	return socknet

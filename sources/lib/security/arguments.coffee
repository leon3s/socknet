###
# Test if arguments as correct type before calling your event
#	@param {array} args arguments incomming from socket event
# @param {object} rules rules of event
# @return {array} return arguments if they past rules or null
###

secureArgs = (args, rules) ->
	secureArg = []
	argsRef = rules.args

	testObject = (obj, objRef) ->
		for key, value of objRef
			if typeof obj[key] isnt value
				return true
		return false

	testArg = (arg, argRef) ->
		if typeof arg isnt argRef.type
			return true
		else if typeof arg is 'object' and testObject arg, argRef.model
			return true
		return false

	setArgs = ->
		for arg, index in argsRef
			return null if testArg args[index], arg
			secureArg.push args[index]
		return secureArg

	setCallback = ->
		return unless secureArg
		if argsRef
		then callback = args[argsRef.length]
		else callback = args[0]
		if typeof callback isnt 'function'
			callback = -> return
		secureArg.push callback

	secureArg = setArgs() if argsRef
	setCallback() if rules.return

	return secureArg

module.exports = secureArgs

chalk = require 'chalk'

print = ->
	print.error = ->
		if typeof arguments[0] is 'string'
			arguments[0] = chalk.red arguments[0]
			console.error.apply null, arguments

	print.success = ->
		if typeof arguments[0] is 'string'
			arguments[0] = chalk.green arguments[0]
			console.log.apply console, arguments

	if arguments.length
		console.log.apply console, arguments

	return print

module.exports = print()

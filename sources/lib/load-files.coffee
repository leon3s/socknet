print = require './print'
path = require 'path'
fs = require 'fs'

loadEvents = (socknet) ->
	socknet.execDir = process.mainModule.paths[0].replace('node_modules', '')
	if typeof arguments[1] is 'string'
		eventsDir = path.join socknet.execDir, arguments[1]
	else
		eventsDir = path.join socknet.execDir, 'netevents'
	unless fs.existsSync eventsDir
		return print.error 'socknet warning -> ',
 			'No netevents directoy found create it or specify a path'
	files = fs.readdirSync eventsDir
	for file in files
		if file.search '.coffee' or file.search '.js'
			filePath = path.join eventsDir, file
			require(filePath)(socknet)

module.exports = loadEvents

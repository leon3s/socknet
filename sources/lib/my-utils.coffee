loadLibrary = ->
	lib = {}
	libPath = path.join __dirname, './lib'
	files = fs.readdirSync libPath
	for file in files
		filePath = path.join libPath, file
		unless fs.lstatSync(filePath).isDirectory()
			key = file.replace '.coffee', ''
			key = key.replace '.js', ''
			if (index = key.indexOf('-')) isnt -1
				key = key.split ''
				delete key[index]
				key[index + 1] = key[index + 1].toUpperCase()
				key = key.join ''
			lib[key] = require filePath
	return lib

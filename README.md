# SOCKNET
## A nodejs websocket framework

I personnaly think http request will dead soon. Since we can build full realtime app based on websocket.
This lib allow you to create websocket server easily with particular security options
	- A socket is connected to private event only after a non error return on authMethod.
	- You have to setup your event with argument type.

### Exemple
Full documentation will come soon !
Exemple a made in coffeescript
Actually all the core of the projet is made with coffeescript

The default configuration directory is netevents

```coffee
module.exports = (socknet) ->

	socknet.auth (socket, credentials, callback) ->
		if credentials.memberId isnt 1
			return callback 'unautorized'
		return callback null, 'welcome user'
	, {
		name: 'login'
		args: [
			{
				type: 'object'
				model: {
					memberId: 'string'
					token: 'string'
				}
			}
		]
	}
```

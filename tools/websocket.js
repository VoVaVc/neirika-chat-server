var server 	= null;
var wss 	= null;

const http = require('http');
const WebSocket = require('ws');
const url = require('url');

const jwt = require('express-jwt');
const config = require('../config.json');

// // route preparator
// exports.sendAll = function(data, type){
// 	type = type ? type : 'update';
//
//
// };

exports.sendTo = function (data, userIds) {
	// this is not a bug, wss.clients have no filter function, so select socket
	// via loop, maybe I need to write & contribute .forEach function in future
	wss.clients.forEach((user) => {
		if(userIds.indexOf(user.clientId) != -1 && user.readyState === WebSocket.OPEN){
			console.log('sending to user')
			user.send(JSON.stringify(data));
		}
	});
};

exports.init = function(app){
	// then goes websocket server
	server = http.createServer(app);
	wss = new WebSocket.Server({ server });

	wss.on('connection', function connection(ws, req) {
		ws.isAlive = true;
		ws.on('pong', heartbeat);
		// const location = url.parse(req.url, true);

	  ws.on('message', function incoming(message) {
	    message = JSON.parse(message);

			if(message.type == 'register'){
				ws.clientId = message.id
			}
			console.log('recieved', message);
	  });
	});

	const interval = setInterval(function ping() {
	  wss.clients.forEach(function each(ws) {
	    if (ws.isAlive === false){
	    	// websocket is terminating
	    	return ws.terminate();
	    }

	    ws.isAlive = false;
	    ws.ping(noop);
	  });
	}, 30000);

	server.listen(5555, function listening() {
	  console.log('Listening on %d', server.address().port);
	});
}


function noop() {}

function heartbeat() {
  this.isAlive = true;
}

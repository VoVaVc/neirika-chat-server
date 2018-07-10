// auth.js

const config      = require('./config.json'),
	bodyParser 		  = require("body-parser"),
	jwt 			      = require('express-jwt'),

	auth 			      = require("./auth"),
  chat 			      = require("./chat"),
  routeBuilder 	  = require("./tools/route-builder");

function assignRoutes(app){
	var URLS = [{
		url: '/login',
		method: auth.login,
		type: 'post'
	},{
		url: '/register',
		method: auth.register,
		type: 'post'
	}];

  var ProtectedURLS = [{
		url: '/getUsers',
		method: chat.getUsers,
		type: 'post'
	}, {
		url: '/getChat',
		method: chat.getChat,
		type: 'post'
	},{
		url: '/getMyId',
		method: chat.getMyId,
		type: 'post'
	}, {
    url: '/getChatId/ByUserId',
    method: chat.getChatIdByUserId,
    type: 'post'
  }, {
    url: '/pushMessage',
    method: chat.pushMessage,
    type: 'post'
  }, {
    url: '/getFile',
    method: chat.getFile,
    type: 'post'
  }, {
    url: '/uploadFile',
    method: chat.uploadFile,
    type: 'post'
  }];


	URLS.forEach(function(path){
		assign(path.type, path.url, path.method);
	})

  ProtectedURLS.forEach(function(path){
		assignProtected(path.type, path.url, path.method);
	})

	function assign(type, path, method){
		app[type](path, function(req, res, next){
			routeBuilder.prepare(req, res, next, method);
		});
	}

  function assignProtected(type, path, method){
		app[type](path, routeBuilder.jwt('jwt_secret'), function(req, res, next){
			routeBuilder.prepare(req, res, next, method);
		});

		routeBuilder.securityOverride(app);
	}
}

exports.assignRoutes = function (app) {
	app.use(bodyParser.urlencoded({
    	extended: true
	}));
	app.use(bodyParser.json());

  assignRoutes(app);
  console.log('routes assigned')

  // by default send 404
  app.get('*', function(req, res){
	   res.sendStatus(404);
	});
};

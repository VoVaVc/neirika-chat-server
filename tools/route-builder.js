const 	config      	= require('../config.json'),
				jwt 					= require('express-jwt');

exports.prepare = function(req, res, next, func){
	var params = req.method == 'GET' ? req.params : req.body;

	// inject current user id to params
	if(req.user && req.user.id){
		params.UserId = req.user.id;
	}

	var funct = func(params, req, res);

	if(typeof funct !== 'undefined'){
		funct.then(function(resp){
			res.send(resp);
		}).catch(function(error){
			console.log(error)
			res.status(404);
			res.send({
				success: false
			});
		});
	}
};

exports.jwt = function(secret){
	return jwt({
		secret: new Buffer(config.app_config[secret], 'base64'),
		getToken: function(req) {
			var token = req.headers['x-authorization'];

			if (token) {
				return token;
			}
			return null;
		}
	})
}

exports.securityOverride = function(app){
	app.use(function (err, req, res, next) {
	  if(err.name === 'UnauthorizedError') {
	  	res.sendStatus(401);
	  }
	});
}

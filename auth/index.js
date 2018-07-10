// clients workaround
// here we are going to inplement our business logic

const db        = require('../tools/db'),
	   config   	= require('../config.json'),
     validator 	= require('../tools/validator'),
     tools 	    = require('../tools/validator');;

const jwt       = require('jsonwebtoken');

exports.login = function(params){
	return new Promise(function(resolve, reject) {
		var valid = validator.check(params, {
			username: 'varchar(255)',
			password: 'varchar(255)',
		});

		if(valid){
      checkLogin(params).then((result) => {
        console.log('login', result);
        if(result && result._id){
          var token = jwt.sign(JSON.stringify({id: result._id}), new Buffer(config.app_config.jwt_secret, 'base64'));

          resolve({
            jwt: token,
            user: result
    			});
        } else {
          resolve({
            success: false
          })
        }
      }).catch(tools.catcher);;
		} else {
			reject('Params validation error');
		}
	});
};

exports.register = function (params) {
  return new Promise(function(resolve, reject) {
		var valid = validator.check(params, {
			username: 'varchar(255)',
			password: 'varchar(255)',
		});

    if(valid){
      checkLogin(params).then((resp) => {
        if(resp && resp._id){
          resolve({
            success     : false,
            code        : 1,
            description : 'user already registered'
          })
        } else {
          db.connect().then((conn) => {
            conn.collection('users').insert({
              username: params.username,
              password: params.password
            }, (err, result) => {
              if (err) {
                reject('something went wrong');
              } else {
                resolve({
                  success: true
                });
              }
            });
          }).catch(tools.catcher);
        }
      }).catch(tools.catcher);
    } else {
      reject('Params validation error');
    }
  });
};

/*
  params
    (varchar) username - user login
    (varchar)[optional] password - user password
*/
function checkLogin(params){
  return new Promise(function(resolve, reject) {
    db.connect().then((conn) => {
      var query = {
        username: params.username,
      };

      // we don't need to check password, if creating new user
      if(params.password){
        query.password = params.password
      }

      console.log(query);

      conn.collection("users").findOne(query, (function(err, result) {
        if (err) {
          reject('something went wrong');
        } else {
          resolve(result);
        }
      }));
    });
  });
}

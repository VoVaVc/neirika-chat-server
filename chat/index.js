// clients workaround
// here we are going to inplement our business logic

const db        = require('../tools/db'),
	   config   	= require('../config.json'),
     validator 	= require('../tools/validator'),
     tools 	    = require('../tools/validator'),
     websocket  = require('../tools/websocket');

const jwt       = require('jsonwebtoken');
const ObjectId  = require('mongodb').ObjectID;
const Binary    = require('mongodb').Binary;

const fs = require('fs');

exports.getUsers = function (params) {
  return new Promise(function(resolve, reject) {
		var valid = validator.check(params, {
			UserId: 'int',
		});

    if(valid){
      db.connect().then((conn) => {
        var query = {'_id':
          {
            $ne: ObjectId(params.UserId)
          }
        };

        conn.collection('users').find(query).toArray((err, result) => {
          if (err) {
            reject('something went wrong');
          } else {
            resolve(result);
          }
        });
      }).catch(tools.catcher);
    } else {
      reject('Params validation error');
    }
  });
};

exports.getChatIdByUserId = function (params) {
  return new Promise(function(resolve, reject) {
		var valid = validator.check(params, {
			userId: 'int',
      UserId: 'int',
		});

    if(valid){
      db.connect().then((conn) => {
        var users = [params.userId, params.UserId],
            query = {
              'users': {
                "$size" : 2,
                "$all": users
              }
            };

        conn.collection('chats').findOne(query, (err, result) => {
          if (err) {
            reject('something went wrong');
          } else {
            if(result){
              // if chat exists, return
              resolve(result)
            } else {
              // otherwise create new chat
              conn.collection('chats').insert({
                users: users,
                data: [],
              }, (err, result) => {
                if (err) {
                  reject('something went wrong');
                } else {
                  console.log('take attention', result);
                  // test this one
                  resolve({
                    success: true
                  });
                }
              });
            }
          }
        });
      }).catch(tools.catcher);
    } else {
      reject('Params validation error');
    }
  });
};

exports.getChat = function (params) {
  return new Promise(function(resolve, reject) {
		var valid = validator.check(params, {
			chatId: 'int',
		});

    if(valid){
      db.connect().then((conn) => {
        var query = {'_id': ObjectId(params.chatId)};

        conn.collection('chats').findOne(query, (err, result) => {
          if (err) {
            reject('something went wrong');
          } else {
            resolve(result.data);
          }
        });
      }).catch(tools.catcher);
    } else {
      reject('Params validation error');
    }
  });
};

exports.getMyId = function (params) {
  return new Promise(function(resolve, reject) {
	   resolve({
       userId: params.UserId
     })
  });
};

// this function can be prettified, but I have no more time to do it,
// maybe someday I'll prettify it
exports.pushMessage = function (params) {
  return new Promise(function(resolve, reject) {
		var valid = validator.check(params, {
			chatId: 'int',
      message: 'text',
      UserId: 'int',
		});

    if(valid){
      db.connect().then((conn) => {
        var pushQueryData = {
          date: new Date().getTime(),
          message: params.message,
          user: params.UserId,
        };

        if(params.file){
          // this is file
          pushQueryData.message = Binary(params.message);
          pushQueryData.file = true;
        }

        conn.collection('chats').update({"_id": ObjectId(params.chatId)}, {
                $push: {
                    "data" : pushQueryData
                }
            }, (err, result) => {
              if (err) {
                reject('something went wrong');
              } else {
                conn.collection('chats').findOne({'_id': ObjectId(params.chatId)}, (err, result) => {
                  if (err) {
                    reject('something went wrong');
                  } else {
                    var sendTo = result.users.filter((item) => {
                      return item != params.UserId;
                    })

                    conn.collection('users').findOne({'_id': ObjectId(params.UserId)}, (err, result) => {
                      websocket.sendTo({
                        type: 'message',
                        name: result.username,
                        message: params.message,
                        pd:{
                          chatId: params.chatId
                        }
                      }, sendTo);
                    });
                  }
                });

                resolve({
                  success: true
                });
              }
            })
      }).catch(tools.catcher);
    } else {
      reject('Params validation error');
    }
  });
};

exports.getFile = function (params) {
  return new Promise(function(resolve, reject) {
		var valid = validator.check(params, {
			datetime: 'text',
      chatId: 'int',
		});

    if(valid){
      db.connect().then((conn) => {
        conn.collection('chats').findOne({
          '_id': ObjectId(params.chatId),
        }, (err, result) => {
          if (err) {
            console.log(err);
            reject('something went wrong');
          } else {
            // warning! говнокод, нужен один запрос с уточнением,
            // но какой-то очень странный баг с фильтром
            console.log(result);
            var file = result.data.filter((item) => {
              return item.date == params.datetime;
            });

            // console.log(file, file[0].message.buffer);
            // var fileContents = Buffer.from(file[0].message, "base64");
            fs.writeFile("somefile.jpg", file[0].message,function(err) {
              console.log("done");
            });
          }
        });
      }).catch(tools.catcher);
    } else {
      reject('Params validation error');
    }
  });
};

exports.uploadFile = function (params, req, res) {
  console.log('uploading file started')
  return new Promise(function(resolve, reject) {
    // var valid = validator.check(params, {
    //   chatId: 'int',
    //   message: 'text',
    //   UserId: 'int',
    // });

    console.log('uploading file started')

    if(req.files){
      let file = req.files.file;

      console.log(file);
    } else {
      reject('Params validation error');
    }
  });
};

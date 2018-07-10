const config      = require('../config.json'),
      MongoClient = require('mongodb').MongoClient;
      assert      = require('assert');

var connection;

exports.connect = function () {
  return new Promise(function(resolve, reject) {
    if(connection){
      resolve(connection);
    } else {
      // Use connect method to connect to the server
      MongoClient.connect(config.db_config.uri, function(err, database) {
        assert.equal(null, err);

        connection = database.db("neirika-chat");;
        console.log("Connected successfully to server");
        resolve(connection);
      });
    }
  });
};

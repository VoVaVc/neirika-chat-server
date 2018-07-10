'use strict';

// some requires
const express = require('express');
const bodyparser = require('body-parser');
const http = require('http');
const cluster = require('cluster');

if(cluster.isMaster && process.env.SERVER_TYPE == 'production'){
// ){
    var numWorkers = require('os').cpus().length;

    console.log('Master cluster setting up ' + numWorkers + ' workers...');
    for(var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        cluster.fork();
    });
} else {
    fireServer();
}

function fireServer(){
  const routes        = require('./routes.js'),
        websocket     = require('./tools/websocket'),
        app           = express();

  const fileUpload = require('express-fileupload');
  app.use(fileUpload());

  // configure app to use bodyParser()
  // this will let us get the data from a POST
  app.use(bodyparser.json({limit: '50mb'}));
  app.use(bodyparser.urlencoded({limit: '50mb', extended: true}));

  routes.assignRoutes(app);

  // Add headers
  app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, X-Authorization, x-keypass");
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
  });

  app.listen(3000);
  console.log('Server listening on port 3000, lets rock!');

  websocket.init(app);
}

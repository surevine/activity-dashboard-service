// Global Variables
environment  = process.env.NODE_ENV || 'production';
config = require('./config.'+environment+'.js'); 

// Require Modules
var express = require('express'),
    TwitterMonitor = require('./modules/twitter');

var app = express();
    
// Monitors
var twitterMonitor = new TwitterMonitor();
twitterMonitor.init();

// Start Application
io = require('socket.io').listen(app.listen(config.app.port));
console.log('Activity dashboard service started successfully');
console.log('Listening on port '+config.app.port);
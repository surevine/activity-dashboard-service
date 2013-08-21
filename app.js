/**
 * Copyright Surevine Ltd. 2013
 *
 * The code herein is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The code herein is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// Global Variables
environment  = process.env.NODE_ENV || 'production';
config = require('./config.'+environment+'.js'); 

// Require Modules
var https = require('https'),
    http = require('http'),
    fs = require('fs'),
    express = require('express');

var app = express();
app.use(express.bodyParser());
    
// Monitors
if(config.twitter.enabled) {
  var TwitterMonitor = require('./modules/twitter');
  var twitterMonitor = new TwitterMonitor();
  twitterMonitor.init(); 
}
if(config.github.enabled) {
  var GithubMonitor = require('./modules/github');
  var githubMonitor = new GithubMonitor();
  githubMonitor.init();
}
if(config.blog.enabled) {
  var BlogMonitor = require('./modules/blog');
  var blogMonitor = new BlogMonitor();
  blogMonitor.init();  
}
if(config.foursquare.enabled) {
  var FoursquareMonitor = require('./modules/foursquare');
  app.post('/checkin', FoursquareMonitor.checkin);
}

// Start Application
var server;
if(config.app.secure) { 
  var sslOptions = {
    key: fs.readFileSync( config.app.ssl.key ),
    cert: fs.readFileSync( config.app.ssl.cert ),
    ciphers: 'ECDHE-RSA-AES128-SHA256:AES128-GCM-SHA256:RC4:HIGH:!MD5:!aNULL:!EDH',
    honorCipherOrder: true
  };
  server =  https.createServer(sslOptions, app); 
}
else {
  server =  http.createServer(app);
}

io = require('socket.io').listen(server.listen(config.app.port));
console.log('Activity dashboard service started successfully');
console.log('Listening on port '+config.app.port);
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
var express = require('express'),
    TwitterMonitor = require('./modules/twitter'),
    GithubMonitor = require('./modules/github'),
    BlogMonitor = require('./modules/blog');

var app = express();
    
// Monitors
var twitterMonitor = new TwitterMonitor();
twitterMonitor.init();

var githubMonitor = new GithubMonitor();
githubMonitor.init();

var blogMonitor = new BlogMonitor();
blogMonitor.init();

// Start Application
io = require('socket.io').listen(app.listen(config.app.port));
console.log('Activity dashboard service started successfully');
console.log('Listening on port '+config.app.port);
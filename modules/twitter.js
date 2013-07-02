// Twitter activity monitor module

var database = require('../database').connection,
    activities = require('../activities'),
    twitter = require('ntwitter');

module.exports = TwitterMonitor = function TwitterMonitor(){};

// Setup activity monitor
TwitterMonitor.prototype.init = function() {
  
  var self = this;
  
  var twit = new twitter( config.twitter );

  // Listen for tweets
  twit.stream('statuses/filter', { follow: '1561479648' }, function(stream) {  
    stream.on('data', function (data) {
      
      // TODO only if debug enabled
      console.log('Received tweet from stream');
      
      var activity = self.formatActivity(data);
      activities.broadcastActivity(activity);
      activities.cacheActivity(activity, 'twitter');
      
    });
    stream.on('end', function (response) {
      // Handle a disconnection      
      console.log('Stream ended, reconnecting...');
      self.init();
    });
    stream.on('destroy', function (response) {
      // Handle a 'silent' disconnection from Twitter, no end/error event fired
      console.log('Stream destroyed...');
    });
  });
  
};

// Build activity object into expected format
TwitterMonitor.prototype.formatActivity = function(activityData) {
  
  // TODO format date...
  // toISOString
  // TODO format the content section (as html for clientside)

  var activity = {
    "content": activityData.text,
    "size": "span3",
    "published": "2013-01-31T11:04:55Z",
    "generator": { 
        "id": "twitter",
        "displayName": "Twitter"
    },
    "actor": {
      "displayName": "@"+activityData.user.screen_name,
      "url": "http://www.twitter.com/"+activityData.user.screen_name
    },
    "verb": "post",
    "object": {
      "url": "https://twitter.com/surevine/status/"+activityData.id_str
    },
    "target": {
      "displayName": "Twitter",
      "url": "http://www.twitter.com"
    }
  };
  
  return activity;
  
};
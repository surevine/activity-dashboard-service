// Twitter activity monitor module

var database = require('../database').connection,
    activityUtils = require('../activities'),
    ntwitter = require('ntwitter');

module.exports = TwitterMonitor = function TwitterMonitor(){};

// Setup activity monitor
TwitterMonitor.prototype.init = function() {
  
  var self = this;
  
  var twitter = new ntwitter( config.twitter );

  // Listen for tweets
  twitter.stream('statuses/filter', { follow: '1561479648' }, function(stream) {  
    stream.on('data', function (data) {
      // Handle incoming tweet
      console.log('Received tweet from stream');
      var activity = self.formatActivity(data);
      activityUtils.broadcast(activity);
      activityUtils.cache(activity, 'twitter');
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
  
  var activity = {
    "id": "twitter-"+activityData.id_str,
    "content": this.formatActivityContent(activityData),
    "size": "span3",
    "published": new Date(activityData.created_at).toISOString(),
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

TwitterMonitor.prototype.formatActivityContent = function(activityData) {
  
  // TODO markup hashtags, URLs and usernames
  
  var content = '<img src="'+activityData.user.profile_image_url+'" alt="'+activityData.user.screen_name+'" class="avatar" />'+
            '<p>'+activityData.text+'</p>'+
            '<div class="actions">'+
            '<a href="https://twitter.com/intent/tweet?in_reply_to='+activityData.id_str+'" title="Reply" target="_blank"><i class="icon-share-alt icon"></i></a>'+
            '<a href="https://twitter.com/intent/retweet?tweet_id='+activityData.id_str+'" title="Retweet" target="_blank"><i class="icon-retweet icon"></i></a>'+
            '<a href="https://twitter.com/intent/favorite?tweet_id='+activityData.id_str+'" title="Favourite" target="_blank"><i class="icon-star icon"></i></a>'+
            '</div>'+
            '<date class="timeago" title="'+new Date(activityData.created_at).toISOString()+'">'+new Date(activityData.created_at).toISOString()+'</date>';
            
  return content;
  
}
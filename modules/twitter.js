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
  twitter.stream('statuses/filter', { follow: config.twitter.follow }, function(stream) {  
    stream.on('data', function (data) {
        
      if(config.twitter.show_original_tweets_only) {
          if(!self.isOriginalTweet(data)) {
            // do nothing if tweet does not originate from an account we are following
            return;
          }
      }
        
      // Handle incoming tweet
      var activity = self.formatActivity(data);
      activityUtils.broadcast(activity);
      activityUtils.cache(activity, 'twitter');
      
    });
    stream.on('error', function(error){
      console.log("Twitter Error: "+error);
      return; // Don't interupt service
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
    "content": this.formatActivityContentString(activityData),
    "size": "span4",
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

// Build HTML string for activity content
TwitterMonitor.prototype.formatActivityContentString = function(activityData) {

  // Markup URLs
  for (var i=0; i<activityData.entities.urls.length; i++) {
    activityData.text = activityData.text.replace(activityData.entities.urls[i].url, '<a href="'+activityData.entities.urls[i].url+'" target="_blank">'+activityData.entities.urls[i].display_url+'</a>');
  }
  
  // Markup Hashtags
  for (var i=0; i<activityData.entities.hashtags.length; i++) {
    activityData.text = activityData.text.replace('#'+activityData.entities.hashtags[i].text, '<a href="https://twitter.com/search?q=%23'+activityData.entities.hashtags[i].text+'&src=hash" target="_blank">#'+activityData.entities.hashtags[i].text+'</a>');
  }

  // Markup User Mentions
  for (var i=0; i<activityData.entities.user_mentions.length; i++) {
    activityData.text = activityData.text.replace('@'+activityData.entities.user_mentions[i].screen_name, '<a href="https://twitter.com/'+activityData.entities.user_mentions[i].screen_name+'" target="_blank">@'+activityData.entities.user_mentions[i].screen_name+'</a>');
  }
  
  var avatarUrl = activityData.user.profile_image_url;
  if(config.app.secure) {
    avatarUrl = activityData.user.profile_image_url_https;
  }
  
  var content = '<a href="http://www.twitter.com/'+activityData.user.screen_name+'" target="_blank">'+
            '<img src="'+avatarUrl+'" alt="'+activityData.user.screen_name+'" class="avatar" />'+
            '</a>'+
            '<p>'+activityData.text+'</p>'+
            '<div class="actions">'+
            '<a href="https://twitter.com/intent/tweet?in_reply_to='+activityData.id_str+'" title="Reply" target="_blank"><i class="icon-share-alt icon"></i></a>'+
            '<a href="https://twitter.com/intent/retweet?tweet_id='+activityData.id_str+'" title="Retweet" target="_blank"><i class="icon-retweet icon"></i></a>'+
            '<a href="https://twitter.com/intent/favorite?tweet_id='+activityData.id_str+'" title="Favourite" target="_blank"><i class="icon-star icon"></i></a>'+
            '</div>'+
            '<date class="timeago" title="'+new Date(activityData.created_at).toISOString()+'">'+new Date(activityData.created_at).toISOString()+'</date>';
            
  return content;
  
}

// Establish whether tweet originates from an account we are following (or whether it is a retweet/mention)
TwitterMonitor.prototype.isOriginalTweet = function(tweet) {
    var accounts = config.twitter.follow.split(",");
    for (var i = 0; i < accounts.length; i++) {
      if(tweet.user.id == accounts[i].trim()) {
        return true;
      }
  }
  return false;
}
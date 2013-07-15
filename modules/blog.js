// Blog activity monitor module

var database = require('../database').connection,
    activityUtils = require('../activities'),
    parser = require('feedparser');

module.exports = BlogMonitor = function BlogMonitor(){};

// Setup activity monitor
BlogMonitor.prototype.init = function() {
  
  var self = this;
  
  setInterval(function(){
    
    parser.parseUrl(config.blog.feed_url, function (err, meta, articles) {
      
      for (var i=0;i<articles.length;i++) {
        
        // Produce uid for activity
        var activityId = "blog-"+articles[i].guid;
        
        activityUtils.ifActivityNotCached(activityId, articles[i], function(activity) {
          var formattedActivity = self.formatActivity(activity);
          activityUtils.broadcast(formattedActivity);
          activityUtils.cache(formattedActivity, "blog");
        });

      }
      
    });
    
  }, config.polls.blog);
  
};

// Build activity object into expected format
BlogMonitor.prototype.formatActivity = function(activity) {
  
  var activity = {
    "id": "blog-"+activity.guid,
    "content": this.formatActivityContentString(activity),
    "size": "span4",
    "published": activity.pubDate,
    "generator": { 
        "id": "blog",
        "displayName": config.blog.title
    },
    "actor": {
      "displayName": activity.author,
      "url": config.blog.author_url+activity.author
    },
    "verb": "post",
    "object": {
      "url": activity.link
    },
    "target": {
      "displayName": config.blog.title,
      "url": config.blog.url
    }
  };
  
  return activity;
  
};

BlogMonitor.prototype.formatActivityContentString = function(activity) {
  var content = '<a href="'+activity['link']+'"><h2>'+activity['title']+'</h2></a>'+
                '<a href="'+config.blog.author_url+activity.author+'">'+activity['author']+'</a>'+
                '<p>'+activity['rss:description']['#']+'</p>'+
                '<a href="'+activity['link']+'">Read More</a>'+
                '<date class="timeago" title="'+new Date(activity.pubDate).toISOString()+'">'+new Date(activity.pubDate).toISOString()+'</date>';
  return content;
}
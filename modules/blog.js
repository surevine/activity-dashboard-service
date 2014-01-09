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
      if (err) {
        console.log("Blog Error: "+err);
        return; // Don't interupt service
      } 
      
      if(articles==undefined) {
        return;
      }
      
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

// Build HTML string for activity content
BlogMonitor.prototype.formatActivityContentString = function(activity) {
  
  var content = '<a href="'+activity['link']+'"><h2>'+activity['title']+'</h2></a>';
                if(activity['rss:description']['#'] != undefined) {
                  content += '<p>'+activity['rss:description']['#']+'</p>'+
                             '<a href="'+activity['link']+'">Read More</a>';
                }
  content += '<date class="timeago" title="'+new Date(activity.pubDate).toISOString()+'">'+new Date(activity.pubDate).toISOString()+'</date>';
  return content;
  
}
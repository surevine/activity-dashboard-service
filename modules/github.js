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

// Github activity monitor module

var database = require('../database').connection,
    activityUtils = require('../activities'),
    GitHubApi = require('github'),
    validator = require('validator');

module.exports = GithubMonitor = function GithubMonitor(){};

// Setup activity monitor
GithubMonitor.prototype.init = function() {
  
  var self = this;   
  
  // API Event types to ignore
  var eventsToIgnore = ['DownloadEvent',
                        'FollowEvent',
                        'GollumEvent',
                        'MemberEvent',
                        'TeamAddEvent',
                        'PublicEvent',
                        'GistEvent',
                        'CommitCommentEvent',
                        'ForkApplyEvent',
                        'IssueCommentEvent', 
                        'PullRequestReviewComment',
                        'WatchEvent',
                        'ReleaseEvent'];

  var github = new GitHubApi({
      // required
      version: "3.0.0",
      // optional
      timeout: 5000
  }); 
  
  setInterval(function(){
    
    github.authenticate({
        type: "basic",
        username: config.github.username,
        password: config.github.password
    });
    
    github.events.getFromOrg({ org: config.github.organisation }, function(err, events) {
      if (err) {
        console.log("Github Error: "+err);
        return; // Don't interupt service
      } 
      
      for (var i = 0; i < events.length; i++) {
        var githubEvent = events[i];
        
        // Ignore certain events from API
        var ignoreEvent = false;
        for (var index = 0; index < eventsToIgnore.length; index++) {
            if (eventsToIgnore[index] === githubEvent.type) {
                ignoreEvent = true;
            }
        }
        if(ignoreEvent) {
          continue;
        }
        
        // Produce uid for activity
        var activityId = "github-"+githubEvent.id;
        
        activityUtils.ifActivityNotCached(activityId, githubEvent, function(activity) {
          var formattedActivity = self.formatActivity(activity);
          activityUtils.broadcast(formattedActivity);
          activityUtils.cache(formattedActivity, "github");
        });

      }
    
    });
    
  }, config.polls.github);

};

// Build activity object into expected format
GithubMonitor.prototype.formatActivity = function(activity) {
  
  var formattedActivity = {
    "id": "github-"+activity.id,
    "size": "span4",
    "published": new Date(activity.created_at).toISOString(),
    "generator": { 
        "id": "github",
        "displayName": "Github"
    },
    "actor": {
      "displayName": activity.actor.login,
      "url": "https://www.github.com/"+activity.actor.login
    },
    "verb": "post",
    "object": {
      "displayName": activity.repo.name,
      "url": "https://www.github.com/"+activity.repo.name
    },
    "target": {
      "displayName": "Github",
      "url": "http://www.github.com"
    }
  };
  
  // Format activity content depending on type
  switch(activity.type) {

    case "CreateEvent":
      formattedActivity.content = this.formatCreateActivity(activity);
      break;
    case "DeleteEvent":
      formattedActivity.content = this.formatDeleteActivity(activity);
      break;
    case "ForkEvent":
      formattedActivity.content = this.formatForkActivity(activity);
      break;
    case "IssuesEvent":
      formattedActivity.content = this.formatIssueActivity(activity);
      break;
    case "PullRequestEvent":
      formattedActivity.content = this.formatPullRequestActivity(activity);
      break;
    case "PushEvent":
      formattedActivity.content = this.formatPushActivity(activity);
      break;          
    default:
      formattedActivity.content = this.formatDefaultActivity(activity);
      break;
  }
  
  return formattedActivity;
  
};

// Build activity object into expected format
GithubMonitor.prototype.formatDefaultActivity = function(activity) {
  var content = '<img src="'+activity.actor.avatar_url+'" alt="'+activity.actor.login+'" class="avatar" />'+
              '<p>'+activity.type+': github-'+activity.id+'</p>';
  return content;
};

GithubMonitor.prototype.formatCommitCommentActivity = function(activity) {
  // TODO
};

GithubMonitor.prototype.formatCreateActivity = function(activity) {

  switch(activity.payload.ref_type) {
    case "repository":
      var content = '<a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+
                '<img src="'+activity.actor.avatar_url+'" alt="'+activity.actor.login+'" class="avatar" />'+
                '</a>'+
                '<p><a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+activity.actor.login+'</a> created '+activity.payload.ref_type+' <a href="https://www.github.com/'+activity.repo.name+'" target="_blank">'+activity.repo.name+'</a>.</p>'+
                '<date class="timeago" title="'+new Date(activity.created_at).toISOString()+'">'+new Date(activity.created_at).toISOString()+'</date>';
    break; 
    case "branch":
      var content = '<a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+
                '<img src="'+activity.actor.avatar_url+'" alt="'+activity.actor.login+'" class="avatar" />'+
                '</a>'+
                '<p><a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+activity.actor.login+'</a> created '+activity.payload.ref_type+' <a href="https://www.github.com/'+activity.repo.name+'/tree/'+activity.payload.ref+'" target="_blank">'+validator.escape(activity.payload.ref)+'</a> in <a href="https://www.github.com/'+activity.repo.name+'" target="_blank">'+activity.repo.name+'</a>.</p>'+
                '<date class="timeago" title="'+new Date(activity.created_at).toISOString()+'">'+new Date(activity.created_at).toISOString()+'</date>';
    break; 
    case "tag":
        var content = '<a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+
                '<img src="'+activity.actor.avatar_url+'" alt="'+activity.actor.login+'" class="avatar" />'+
                '</a>'+
                '<p><a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+activity.actor.login+'</a> created '+activity.payload.ref_type+' <a href="https://www.github.com/'+activity.repo.name+'/releases/'+activity.payload.ref+'" target="_blank">'+validator.escape(activity.payload.ref)+'</a> in <a href="https://www.github.com/'+activity.repo.name+'" target="_blank">'+activity.repo.name+'</a>.</p>'+
                '<date class="timeago" title="'+new Date(activity.created_at).toISOString()+'">'+new Date(activity.created_at).toISOString()+'</date>';
    break; 
    default:
      var content = '<a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+
                '<img src="'+activity.actor.avatar_url+'" alt="'+activity.actor.login+'" class="avatar" />'+
                '</a>'+
                '<p><a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+activity.actor.login+'</a> created '+activity.payload.ref_type+' '+validator.escape(activity.payload.ref)+' in <a href="https://www.github.com/'+activity.repo.name+'" target="_blank">'+activity.repo.name+'</a>.</p>'+
                '<date class="timeago" title="'+new Date(activity.created_at).toISOString()+'">'+new Date(activity.created_at).toISOString()+'</date>';
    break;
  }
  return content;
};

GithubMonitor.prototype.formatDeleteActivity = function(activity) {
  var content = '<a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+
                '<img src="'+activity.actor.avatar_url+'" alt="'+activity.actor.login+'" class="avatar" />'+
                '</a>'+
                '<p><a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+activity.actor.login+'</a> deleted '+activity.payload.ref_type+' '+validator.escape(activity.payload.ref)+' from <a href="https://www.github.com/'+activity.repo.name+'" target="_blank">'+activity.repo.name+'</a>.</p>'+
                '<date class="timeago" title="'+new Date(activity.created_at).toISOString()+'">'+new Date(activity.created_at).toISOString()+'</date>';
  return content;
};

GithubMonitor.prototype.formatForkActivity = function(activity) {
  var content = '<a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+
                '<img src="'+activity.actor.avatar_url+'" alt="'+activity.actor.login+'" class="avatar" />'+
                '</a>'+
                '<p><a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+activity.actor.login+'</a> forked <a href="https://www.github.com/'+activity.repo.name+'" target="_blank">'+activity.repo.name+'</a> to <a href="https://www.github.com/'+activity.payload.forkee.full_name+'" target="_blank">'+activity.payload.forkee.full_name+'</a>.</p>'+
                '<date class="timeago" title="'+new Date(activity.created_at).toISOString()+'">'+new Date(activity.created_at).toISOString()+'</date>';
  return content;
};

GithubMonitor.prototype.formatForkApplyActivity = function(activity) {
  // TODO
};

GithubMonitor.prototype.formatGistActivity = function(activity) {
  // TODO
};

GithubMonitor.prototype.formatIssueCommentActivity = function(activity) {
  // TODO
};

GithubMonitor.prototype.formatIssueActivity = function(activity) {
  var content = '<a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+
                '<img src="'+activity.actor.avatar_url+'" alt="'+activity.actor.login+'" class="avatar" />'+
                '</a>'+
                '<p><a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+activity.actor.login+'</a> '+activity.payload.action+' issue <a href="'+activity.payload.issue.html_url+'" target="_blank">#'+activity.payload.issue.number+' - '+validator.escape(activity.payload.issue.title)+'</a> in <a href="https://www.github.com/'+activity.repo.name+'" target="_blank">'+activity.repo.name+'</a>.</p>'+
                '<date class="timeago" title="'+new Date(activity.created_at).toISOString()+'">'+new Date(activity.created_at).toISOString()+'</date>';
  return content; 
};

GithubMonitor.prototype.formatPullRequestActivity = function(activity) {
  var content = '<a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+
                '<img src="'+activity.actor.avatar_url+'" alt="'+activity.actor.login+'" class="avatar" />'+
                '</a>'+
                '<p><a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+activity.actor.login+'</a> '+activity.payload.action+' pull request <a href="'+activity.payload.pull_request.html_url+'" target="_blank">'+validator.escape(activity.payload.pull_request.title)+'</a> in <a href="https://www.github.com/'+activity.repo.name+'" target="_blank">'+activity.repo.name+'</a>.</p>'+
                '<p class="details">'+
                '<span class="commits">'+activity.payload.pull_request.commits+' commits</span>'+
                '<span class="additions">'+activity.payload.pull_request.additions+'++</span>'+
                '<span class="deletions">'+activity.payload.pull_request.deletions+'--</span>'+
                '</p>'+
                '<date class="timeago" title="'+new Date(activity.created_at).toISOString()+'">'+new Date(activity.created_at).toISOString()+'</date>';
  return content;
};

GithubMonitor.prototype.formatPullRequestReviewCommentActivity = function(activity) {
  // TODO
};

GithubMonitor.prototype.formatPushActivity = function(activity) { 
  // TODO format date
  var content = '<a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+
                '<img src="'+activity.actor.avatar_url+'" alt="'+activity.actor.login+'" class="avatar" />'+
                '</a>'+
                '<p><a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+activity.actor.login+'</a> pushed <a href="https://www.github.com/'+activity.repo.name+'/commits?author='+activity.actor.login+'" target="_blank">'+activity.payload.size+' commits</a> to <a href="https://www.github.com/'+activity.repo.name+'" target="_blank">'+activity.repo.name+'</a>.</p>'+
                '<date class="timeago" title="'+new Date(activity.created_at).toISOString()+'">'+new Date(activity.created_at).toISOString()+'</date>';
  return content;
};

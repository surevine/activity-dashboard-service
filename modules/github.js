// Github activity monitor module

var database = require('../database').connection,
    activityUtils = require('../activities'),
    GitHubApi = require('github'),
    sanitize = require('validator').sanitize;

module.exports = GithubMonitor = function GithubMonitor(){};

// Setup activity monitor
GithubMonitor.prototype.init = function() {
  
  var self = this;   
  
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
                      'WatchEvent'];  

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

// Format activity depending on type
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
                '<p><a href="https://www.github.com/'+activity.actor.login+'">'+activity.actor.login+'</a> created '+activity.payload.ref_type+' <a href="https://www.github.com/'+activity.repo.name+'">'+activity.repo.name+'</a>.</p>'+
                '<date class="timeago" title="'+new Date(activity.created_at).toISOString()+'">'+new Date(activity.created_at).toISOString()+'</date>';
    break; 
    case "branch":
      var content = '<a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+
                '<img src="'+activity.actor.avatar_url+'" alt="'+activity.actor.login+'" class="avatar" />'+
                '</a>'+
                '<p><a href="https://www.github.com/'+activity.actor.login+'">'+activity.actor.login+'</a> created '+activity.payload.ref_type+' <a href="https://www.github.com/'+activity.repo.name+'/tree/'+activity.payload.ref+'">'+sanitize(activity.payload.ref).entityEncode()+'</a> in <a href="https://www.github.com/'+activity.repo.name+'">'+activity.repo.name+'</a>.</p>'+
                '<date class="timeago" title="'+new Date(activity.created_at).toISOString()+'">'+new Date(activity.created_at).toISOString()+'</date>';
    break; 
    case "tag":
        var content = '<a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+
                '<img src="'+activity.actor.avatar_url+'" alt="'+activity.actor.login+'" class="avatar" />'+
                '</a>'+
                '<p><a href="https://www.github.com/'+activity.actor.login+'">'+activity.actor.login+'</a> created '+activity.payload.ref_type+' <a href="https://www.github.com/'+activity.repo.name+'/releases/'+activity.payload.ref+'">'+sanitize(activity.payload.ref).entityEncode()+'</a> in <a href="https://www.github.com/'+activity.repo.name+'">'+activity.repo.name+'</a>.</p>'+
                '<date class="timeago" title="'+new Date(activity.created_at).toISOString()+'">'+new Date(activity.created_at).toISOString()+'</date>';
    break; 
    default:
      var content = '<a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+
                '<img src="'+activity.actor.avatar_url+'" alt="'+activity.actor.login+'" class="avatar" />'+
                '</a>'+
                '<p><a href="https://www.github.com/'+activity.actor.login+'">'+activity.actor.login+'</a> created '+activity.payload.ref_type+' '+sanitize(activity.payload.ref).entityEncode()+' in <a href="https://www.github.com/'+activity.repo.name+'">'+activity.repo.name+'</a>.</p>'+
                '<date class="timeago" title="'+new Date(activity.created_at).toISOString()+'">'+new Date(activity.created_at).toISOString()+'</date>';
    break;
  }
  return content;
};

GithubMonitor.prototype.formatDeleteActivity = function(activity) {
  var content = '<a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+
                '<img src="'+activity.actor.avatar_url+'" alt="'+activity.actor.login+'" class="avatar" />'+
                '</a>'+
                '<p><a href="https://www.github.com/'+activity.actor.login+'">'+activity.actor.login+'</a> deleted '+activity.payload.ref_type+' '+sanitize(activity.payload.ref).entityEncode()+' from <a href="https://www.github.com/'+activity.repo.name+'">'+activity.repo.name+'</a>.</p>'+
                '<date class="timeago" title="'+new Date(activity.created_at).toISOString()+'">'+new Date(activity.created_at).toISOString()+'</date>';
  return content;
};

GithubMonitor.prototype.formatForkActivity = function(activity) {
  var content = '<a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+
                '<img src="'+activity.actor.avatar_url+'" alt="'+activity.actor.login+'" class="avatar" />'+
                '</a>'+
                '<p><a href="https://www.github.com/'+activity.actor.login+'">'+activity.actor.login+'</a> forked <a href="https://www.github.com/'+activity.repo.name+'">'+activity.repo.name+'</a> to <a href="https://www.github.com/'+activity.payload.forkee.full_name+'">'+activity.payload.forkee.full_name+'</a>.</p>'+
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
                '<p><a href="https://www.github.com/'+activity.actor.login+'">'+activity.actor.login+'</a> '+activity.payload.action+' issue <a href="'+activity.payload.issue.html_url+'">#'+activity.payload.issue.number+' - '+sanitize(activity.payload.issue.title).entityEncode()+'</a> in <a href="https://www.github.com/'+activity.repo.name+'">'+activity.repo.name+'</a>.</p>'+
                '<date class="timeago" title="'+new Date(activity.created_at).toISOString()+'">'+new Date(activity.created_at).toISOString()+'</date>';
  return content; 
};

GithubMonitor.prototype.formatPullRequestActivity = function(activity) {
  var content = '<a href="https://www.github.com/'+activity.actor.login+'" target="_blank">'+
                '<img src="'+activity.actor.avatar_url+'" alt="'+activity.actor.login+'" class="avatar" />'+
                '</a>'+
                '<p><a href="https://www.github.com/'+activity.actor.login+'">'+activity.actor.login+'</a> '+activity.payload.action+' pull request <a href="'+activity.payload.pull_request.html_url+'">'+sanitize(activity.payload.pull_request.title).entityEncode()+'</a> in <a href="https://www.github.com/'+activity.repo.name+'">'+activity.repo.name+'</a>.</p>'+
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
                '<p><a href="https://www.github.com/'+activity.actor.login+'">'+activity.actor.login+'</a> pushed <a href="https://www.github.com/'+activity.repo.name+'/commits?author='+activity.actor.login+'">'+activity.payload.size+' commits</a> to <a href="https://www.github.com/'+activity.repo.name+'">'+activity.repo.name+'</a>.</p>'+
                '<date class="timeago" title="'+new Date(activity.created_at).toISOString()+'">'+new Date(activity.created_at).toISOString()+'</date>';
  return content;
};

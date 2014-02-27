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

// Foursquare checkin monitor module

var database = require('../database').connection,
    activityUtils = require('../activities');

module.exports = FoursquareMonitor = {
  
  // Setup activity monitor
  checkin: function(req, res) {
    
    try {

      var checkin = JSON.parse(req.body.checkin);
      
      // Produce unique id for activity
      var activityId = "foursquare-"+checkin.id;
      
      var formattedActivity = FoursquareMonitor.formatActivity(checkin);
      activityUtils.broadcast(formattedActivity);
      activityUtils.cache(formattedActivity, "foursquare");

    }
    catch(err) {
      
      console.log("Foursquare Checkin Error: " + err);
      
      // always return success back to foursquare api
      res.send(200); 
      
    }
      
    res.send(200);

  },

  // Build activity object into expected format
  formatActivity: function(checkin) {

    var checkinUser = checkin.user;

    var activity = {
      "id": "foursquare-"+checkin.id,
      "content": this.formatActivityContentString(checkin),
      "size": "span4",
      "published": new Date(checkin.createdAt * 1000).toISOString(),
      "generator": {
          "id": "foursquare",
          "displayName": "Foursquare"
      },
      "actor": {
        "displayName": checkinUser.firstName+' '+checkinUser.lastName,
        "url": "https://www.foursquare.com/user/"+checkinUser.id
      },
      "verb": "post",
      "object": {
        "id": checkin.id,
        "url": "https://www.foursquare.com/"
      },
      "target": {
        "displayName": "Foursquare",
        "url": "https://www.foursquare.com/"
      }
    };

    return activity;

  },

  // Build HTML string for activity content
  formatActivityContentString: function(checkin) {

    var checkinUser = checkin.user;
    var checkinVenue = checkin.venue;

    var content = '<a href="https://www.foursquare.com/user/'+checkinUser.id+'" target="_blank"><img src="'+checkinUser.photo+'" alt="avatar" /></a>'+
                  '<p>'+
                  '<a href="https://www.foursquare.com/user/'+checkinUser.id+'" target="_blank">'+checkinUser.firstName+' '+checkinUser.lastName+'</a>'+
                  ' checked in to '+
                  '<a href="https://www.foursquare.com/v/'+checkinVenue.id+'" target="_blank">'+checkinVenue.name+'</a>.'+
                  '</p>';
    content +=    '<date class="timeago" title="'+new Date(checkin.createdAt * 1000).toISOString()+'">'+new Date(checkin.createdAt * 1000).toISOString()+'</date>';
    return content;

  }
  
};
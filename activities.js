var database = require('./database').connection;

module.exports = Activities = {

  // Send activity to all connections on socket
  broadcast: function(activity) {
    io.sockets.emit('activity', activity);
  },

  // Save activity to database
  cache: function(activity, type) {
  
    // Augment activity with additional info for database
    var databaseEntry = {
      activityId: activity.id,
      data: JSON.stringify(activity),
      type: type,
      created: this.toMySQLDateTime(new Date(activity.published))
    };
    
    var query = database.query("INSERT INTO "+config.db.table+" SET ?", databaseEntry, function(err, result) {
      if (err) {
        console.log("Database Error inserting activity into table: "+err);
        return;
      }
    
      console.log("Cached activity: "+activity.id);
      
    });
  
  },
  
  // Only run callback function if activity not already cached
  // param callback code to be executed if activity not cached
  ifActivityNotCached: function(activityId, activity, callback) {
    
    if((typeof callback) != "function") {
      throw new Error("callback parameter not a function");
    }
    
    var query = database.query("SELECT * FROM "+config.db.table+" WHERE activityId = ?", activityId, function(err, result) {
      if (err) {
        console.log("Database Error querying activity table: "+err);
        return;
      }
      
      if(result.length == 0) {
        // Activity not cached, so run callback
        callback(activity);
      }
      
    });

  },
  
  // Return date formatted as Mysql datetime 
  toMySQLDateTime: function(date) {
      return date.getUTCFullYear() + "-" + this.zerofillDatePart(date.getUTCMonth()) + "-" + this.zerofillDatePart(date.getUTCDate()) + " " + this.zerofillDatePart(date.getUTCHours()) + ":" + this.zerofillDatePart(date.getUTCMinutes()) + ":" + this.zerofillDatePart(date.getUTCSeconds());
  },
  
  // zerofill's date part to 2 digits
  zerofillDatePart: function(number) {
    return ("0" + number).slice(-2);
  }
  
};
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
      created: new Date().getTime() // TODO fix the formatting here, needs to be mysql compliant timestamp
    };
    
    var query = database.query("INSERT INTO "+config.db.table+" SET ?", databaseEntry, function(err, result) {
      if (err) throw err;
    
      console.log("cached activity "+activity.id);
      
    });
  
  },
  
  // Only run callback function if activity not already cached
  // param callback code to be executed if activity not cached
  ifActivityNotCached: function(activityId, activity, callback) {
    
    if((typeof callback) != "function") {
      throw new Error("callback parameter not a function");
    }
    
    var query = database.query("SELECT * FROM "+config.db.table+" WHERE activityId='"+activityId+"'", function(err, result) {
      if (err) throw err;
      
      if(result.length == 0) {
        // Activity not cached, so run callback
        callback(activity);
      }
      
    });

  },
  
  // Formats an activities date into consistent, readable string
  // Expects javascript date object
  formatActivityDate: function(date) {
    return this.zerofillDatePart(date.getDate())+'/'+this.zerofillDatePart(date.getMonth())+'/'+date.getFullYear()+', '+this.zerofillDatePart(date.getHours())+':'+this.zerofillDatePart(date.getMinutes());
  },
  
  // zerofill's date part to 2 digits
  zerofillDatePart: function(number) {
    return ("0" + number).slice(-2);
  }
  
};
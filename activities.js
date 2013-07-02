var database = require('./database').connection;

module.exports = Activities = {

  // Send activity to all connections on socket
  broadcastActivity: function(activity) {
    io.sockets.emit('activity', activity);
  },

  // Save activity to database
  cacheActivity: function(activity, type) {
  
    var self = this;
  
    // Augment activity with additional info for database
    var databaseEntry = {
      data: JSON.stringify(activity),
      type: type,
      created: new Date().getTime() // TODO fix the formatting here, needs to be mysql compliant timestamp
    };
  
    var query = database.query('INSERT INTO '+config.db.table+' SET ?', databaseEntry, function(err, result) {
      if (err) throw err;
    
      console.log("Cached Tweet Activity");
      
    });
  
  }
  
};
var mysql = require('mysql');

exports.connection = connection = mysql.createConnection( config.db );

connection.on('error', function(err) {
    console.log('Database Error: '+err);
    //if(err.code === 'PROTOCOL_CONNECTION_LOST') {
    //  handleDisconnect();                         
    //}
});
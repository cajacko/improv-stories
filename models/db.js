/**
* Connect to the database
*/

var mysql = require('mysql');
var config = require('../config'); // Get the config file that stores all the database details

// Set up the database connection with all the required details
var connection = mysql.createConnection({
    host: config.MySql.host,
    user: config.MySql.user,
    password: config.MySql.password,
    database: config.MySql.database
});

// Log if the connection succeeded or not
connection.connect(function(err) {
    if (err) {
        console.log('Error connecting to the database');
    } else {
        console.log('Connected to the Database');
    }
});

module.exports = connection; // Export the connection to be used by other files

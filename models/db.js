var mysql = require('mysql');
var config = require('../config');

var connection = mysql.createConnection({
  host     : config.MySql.host,
  user     : config.MySql.user,
  password : config.MySql.password,
  database : config.MySql.database
});

connection.connect(function(err) {
	if(err) {
		console.log('Error connecting to the database');
	} else {
		console.log('Connected to the Database');
	}
});

module.exports = connection;
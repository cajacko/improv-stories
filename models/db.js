var mysql = require('mysql');
var config = require('../config');

var connection = mysql.createConnection({
  host     : config.MySql.host,
  user     : config.MySql.user,
  password : config.MySql.password,
  database : config.MySql.database
});

connection.connect();

module.exports = connection;
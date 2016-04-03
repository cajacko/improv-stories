var db = require('../models/db');

exports.getUser = function(req, cb) {
	if(req.user) {
		db.query('SELECT * from users WHERE facebook_id = "' + req.user._json.id + '"', function(err, rows, fields) {
			if(err) {
				console.log('Error getting users');
				cb(false);
			} else if(rows.length) {
				var user = {
					id: rows[0].id,
					facebookId: rows[0].facebook_id,
					displayName: rows[0].display_name,
					firstName: rows[0].first_name,
					lastName: rows[0].last_name,
					email: rows[0].email
				};

				cb(user);
			} else {
				db.query('INSERT INTO users (facebook_id, display_name, first_name, last_name, email) VALUES (' + req.user._json.id + ', "' + req.user._json.name + '", "' + req.user._json.first_name + '", "' + req.user._json.last_name + '", "' + req.user._json.email + '")', function(err, result) {
					if(err) {
						console.log('Error inserting new user');
						cb(false);
					} else {
						var user = {
							id: result.insertId,
							facebookId: req.user._json.id,
							displayName: req.user._json.name,
							firstName: req.user._json.first_name,
							lastName: req.user._json.last_name,
							email: req.user._json.email
						};

						cb(user);
					}
				});
			}
		});  
	} else {
		cb(false);
	}
}

exports.allOtherUsers = function(userId, cb) {
	db.query('SELECT * from users WHERE id != "' + userId + '" ORDER BY rand()', function(err, rows, fields) {
		cb(err, rows);
    });
}
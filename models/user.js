/**
 * Process all the interactions with the database that involve users
 */

var db = require('../models/db'); // Load the database connection

// Get the current user
exports.getUser = function(req, next) {
    /** 
     * If there is a user in the request then set them up. This 
     * req.user gets set up by passbook-facebook when someone 
     * is logged in with their facebook id.
     *
     * If there isn't a user then perform the callback whilst 
     * passing false
     */
    if(req.user) {
        // Get the user based off their facebook id
        db.query('SELECT * from users WHERE facebook_id = ?', [req.user._json.id], function(err, rows, fields) {
            // If there is a query user then return false
            if(err) {
                next(false);
            } 
            // If a user was found then return the user details
            else if(rows.length) {
                // Set up user details
                var user = {
                    id: rows[0].id,
                    facebookId: rows[0].facebook_id,
                    displayName: rows[0].display_name,
                    firstName: rows[0].first_name,
                    lastName: rows[0].last_name,
                    email: rows[0].email
                };

                next(user);
            } else {
                // No user was found with that facebook id, so add them
                db.query('INSERT INTO users (facebook_id, display_name, first_name, last_name, email) VALUES (?, ?, ?, ?, ?)', [req.user._json.id, req.user._json.name, req.user._json.first_name, req.user._json.last_name, req.user._json.email], function(err, result) {
                    // If there was a MySQL error the return false
                    if(err) {
                        next(false);
                    } else {
                        // Insert was successful so return user
                        var user = {
                            id: result.insertId,
                            facebookId: req.user._json.id,
                            displayName: req.user._json.name,
                            firstName: req.user._json.first_name,
                            lastName: req.user._json.last_name,
                            email: req.user._json.email
                        };

                        next(user);
                    }
                });
            }
        });  
    } else {
        next(false); 
    }
}

// Return all the users except the current one
exports.allOtherUsers = function(userId, next) {
    db.query('SELECT * from users WHERE id != ? ORDER BY rand()', [userId], function(err, users, fields) {
        next(err, users); // Return the error status and the users
    });
}
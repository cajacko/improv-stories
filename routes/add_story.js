/**
 * If a valid request comes in add the story or handle errors
 */

var express = require('express'),
    router = express.Router(),
    story = require('../models/story'),
    user = require('../models/user');

// For all routes into '/add-story'
router.all('/', function(req, res, next) {
    // Get the current user
    user.getUser(req, function(userDetails) {
        // If the user is logged in then add the story, otherwise redirect to home
        if(userDetails) {
            // If the POST action is 'addStory' then add the story, otherwise render the add story page
            if(req.body.action == 'addStory') {
                // TODO: validate that the correct fields exist and handle errors

                var authors = req.body.authors; // Get the authors

                // If the authors var is a string turn it into an array, otherwise if it is blank initiate a blank array
                if(typeof authors === 'string') {
                    authors = [ authors ];
                } else if(typeof authors === 'undefined') {
                    authors = [];
                }

                authors.push(userDetails.id); // Push the current users ID into the authors array

                // Create the story and redirect to that story page, or handle the error
                story.create(req.body.codename, authors, req.body.entryTime, req.body.visibility, function(err, insertId) {
                    // If there is an error then notify the user
                    if(err) {
                        res.send('Error adding story');
                    } else {
                        res.redirect('/story/' + insertId); // Redirect to the story page
                    }
                });
            } else {
                // Not a POST request so show the add story page. First get all the other users to show in the author box
                user.allOtherUsers(userDetails.id, function(err, rows) {
                    // If there was an error getting the other users then alert the user
                    if(err) {
                        // TODO: error page if something went wrong
                        res.redirect('/');
                    } else {
                        res.render('pages/add_story', {users: rows}); // Show the add story page
                    }
                });
            }
        } else {
            // User is not logged in, redirect to home
            res.redirect('/');
        }
    });
});

module.exports = router;
/**
 * Get the story page
 */

var express = require('express');
var router = express.Router();
var story = require('../models/story');
var user = require('../models/user');

// Route all requests for '/story/*'
router.get('/', function(req, res) {
    var path = req._parsedOriginalUrl.path; // Get the url path
    path = path.split('/'); // Split the path by the slashes

    // If the path has the correct amount of params and the id is numeric than continue
    if (path.length == 3 && !isNaN(!path[2])) {
        // Get the current user
        user.getUser(req, function(userDetails) {
            // If the user is logged in save the entry otherwise return an error
            if (userDetails) {
                // Get the story
                story.getStory(path[2], userDetails.id, function(err, entries, story, currentUserWasLast) {
                    // If there was an error getting the story then display the error, otherwise show the story
                    if (err) {
                        res.send('Error getting the story');
                    } else {
                        var userTurn = true;

                        if (currentUserWasLast) {
                            userTurn = false;
                        }

                        res.render('pages/story', {page: 'story', title: story.codename, entryTime: story.entry_time, userTurn: userTurn, back: '/', entries: entries});
                    }
                });
            } else {
                // The user is not logged in, redirect
                res.redirect('/'); // Redirect to the story page
            }
        });
    } else {
        res.send('Bad url');
    }
});

module.exports = router;

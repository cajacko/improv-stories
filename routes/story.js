/**
 * Get the story page
 */

var express = require('express');
var router = express.Router();
var story = require('../models/story');
var user = require('../models/user');

// Route all requests for '/story/*'
router.get('/', function(req, res) {
    // TODO: Get the story via the id
    // TODO: Validate the id

    // Get the current user
    user.getUser(req, function(userDetails) {
        // If the user is logged in save the entry otherwise return an error
        if (userDetails) {
            // Get the story
            story.getStory(15, function(err, entries) {
                // If there was an error getting the story then display the error, otherwise show the story
                if (err) {

                } else {
                    res.render('pages/story', {page: 'story', title: 'Story Title', userTurn: true, back: '/', entries: entries});
                }
            });
        } else {
            // The user is not logged in, redirect
            res.redirect('/'); // Redirect to the story page
        }
    });
});

module.exports = router;

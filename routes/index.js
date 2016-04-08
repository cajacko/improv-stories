/**
 * Define all the routes and which scripts control them.
 *
 * Display the home page
 */

var express = require('express');
var router = express.Router();
var user = require('../models/user');
var story = require('../models/story');

router.use('/add-story', require('./add_story')); // Add story page and action
router.use('/login/facebook', require('./login/facebook')); // Facebook login redirect
router.use('/next-story', require('./next_story')); // Get the next story
router.use('/save-entry', require('./save_entry')); // Save an entry
router.use('/story/*', require('./story')); // Story page

// Display the home page
router.get('/', function(req, res) {
    // Get the current user if they exists
    user.getUser(req, function(userDetails) {
        // If the user exists show the dashboard, otherwise show the login page
        if (userDetails) {
            // Get all the stories the current user is an author of
            story.getUserStories(userDetails.id, function(err, stories) {
                /**
                 * If there was an error then notify the user otherwise show the dashboard.
                 *
                 * If there are stories then show them
                 */
                if (err) {
                    res.send('Error loading the dashboard');
                } else if (stories.length) {
                    res.render('pages/dashboard', {stories: stories});
                } else {
                    res.render('pages/dashboard', {stories: false});
                }
            });
        } else {
            // The user is not logged in, show the login page
            res.render('pages/login');
        }
    });
});

module.exports = router;

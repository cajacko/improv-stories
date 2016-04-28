/**
 * Get the next entry to a story
 */

var express = require('express');
var router = express.Router();
var story = require('../models/story');
var user = require('../models/user');

// Get all requests to '/next-story'
router.post('/', function(req, res) {
    // Get the current user
    user.getUser(req, function(userDetails) {
        // If the user is logged in get the next entry otherwise return an error
        if (userDetails) {
            // If the post request is for nextEntry then get it, otherwise return false
            if (req.body.action == 'nextEntry') {
                // TODO: validate the values

                // Get the next entry
                story.getLastEntry(req.body.storyId, function(err, entries, user) {
                    // If there was an error getting the next entry then return false, otherwise return the entry
                    if (err) {
                        res.json(false);
                    } else {
                        // If there are no entries then return that it is a new story
                        if (entries == 'noEntries') {
                            res.json({newStory: true}); // Return the entry
                        } else {
                            var json = {user: user, entries: entries};
                            res.json(json); // Return the entry
                        }
                    }
                });
            } else {
                res.json(false);
            }
        } else {
            res.json(false);
        }
    });
});

module.exports = router;

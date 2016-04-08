/**
 * Save a new entry
 */

var express = require('express');
var router = express.Router();
var story = require('../models/story');
var user = require('../models/user');

// Route all post requests to '/save-entry'
router.post('/', function(req, res) {
    // Get the current user
    user.getUser(req, function(userDetails) {
        // If the user is logged in save the entry otherwise return an error
        if (userDetails) {
            // If the post request is for saveEntry then save the entry, otherwise return false
            if (req.body.action == 'saveEntry') {
                // TODO: validate the values

                // Save the entry
                story.saveEntry(userDetails.id, req.body.storyId, req.body.story, function(success) {
                    // If the query was successful then return true, otherwise return false
                    if (success) {
                        res.json(true);
                    } else {
                        res.json(false);
                    }
                });
            } else {
                // POST error
                res.json(false);
            }
        } else {
            // The user is not logged in, return false
            res.json(false);
        }
    });
});

module.exports = router;

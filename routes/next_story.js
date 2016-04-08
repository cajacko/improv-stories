/**
 * Get the next entry to a story
 */

var express = require('express');
var router = express.Router();
var story = require('../models/story');

// Get all requests to '/next-story'
router.get('/', function(req, res) {
    // TODO: move this to the story page and get the id from there

    // Get the last entry for the specified story
    story.getLastEntry(15, function(err, entries) {
        // If there was an error getting the next entry then return false, otherwise return the entry
        if (err) {
            res.json(false);
        } else {
            res.json(entries); // Return the entry
        }
    });
});

module.exports = router;

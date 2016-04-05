/**
 * Get the story page
 */

var express = require('express'),
    router = express.Router(),
    story = require('../models/story');

// Route all requests for '/story/*'
router.get('/', function(req, res, next) {
    // TODO: Get the story via the id

    // TODO: Validate the id

    // Get the story
    story.getStory(15, function(err, entries) {
        // If there was an error getting the story then display the error, otherwise show the story
        if(err) {

        } else {
            res.render('pages/story', {page: 'story', title: 'Story Title', userTurn: true, back: '/', entries: entries});
        }
    });  
});

module.exports = router;
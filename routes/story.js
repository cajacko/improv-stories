var express = require('express');
var router = express.Router();
var story = require('../models/story');

router.get('/', function(req, res, next) {
	story.getStory(15, function(err, entries) {
		if(err) {

		} else {
			res.render('pages/story', {page: 'story', title: 'Story Title', userTurn: true, back: '/', entries: entries});
		}
	});  
});

module.exports = router;
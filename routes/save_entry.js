var express = require('express');
var router = express.Router();
var story = require('../models/story');
var user = require('../models/user');

router.post('/', function(req, res, next) {
	user.getUser(req, function(userDetails) {
		if(userDetails) {
			if(req.body.action == 'saveEntry') {
				story.saveEntry(userDetails.id, req.body.storyId, req.body.story, function(success) {
					if(success) {
						console.log('success');
						var json = true;
						res.json(json);
					} else {
						console.log('Error saving the entry');
						var json = false;
						res.json(json);
					}
				});
			} else {
				console.log('Error confirming post action');
				var json = false;
				res.json(json);
			}
		} else {
			console.log('Error loggin in user');
			var json = false;
			res.json(json);
		}
	});
});

module.exports = router;
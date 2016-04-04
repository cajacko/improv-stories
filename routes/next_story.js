var express = require('express');
var router = express.Router();
var story = require('../models/story');

router.get('/', function(req, res, next) {

	story.getLastEntry(15, function(err, entries) {
		if(err) {
			res.json(false);
		} else {
			res.json(entries);
		}
	});

	
});

module.exports = router;
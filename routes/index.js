var express = require('express');
var router = express.Router();
var user = require('../models/user');
var story = require('../models/story');

router.use('/add-story', require('./add_story'));
router.use('/login/facebook', require('./login/facebook'));
router.use('/next-story', require('./next_story'));
router.use('/save-entry', require('./save_entry'));
router.use('/story/*', require('./story'));

router.get('/', function(req, res, next) {
  user.getUser(req, function(userDetails) {
    if(userDetails) {
      story.getUserStories(userDetails.id, function(err, stories) {
        if(err) {
          console.log('Error getting the user stories');
          res.send('Error loading the dashboard');
        } else if(stories.length) {
          res.render('pages/dashboard', { stories: stories });
        } else {
          res.render('pages/dashboard', { stories: false });
        }
      });
    } else {
      res.render('pages/login');
    }
  });
});

module.exports = router;
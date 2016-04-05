var express = require('express');
var router = express.Router();
var story = require('../models/story');
var user = require('../models/user');

router.all('/', function(req, res, next) {
  user.getUser(req, function(userDetails) {
    if(userDetails) {
      if(req.body.action == 'addStory') {
        var authors = req.body.authors;

        if(typeof authors === 'string') {
          authors = [ authors ];
        } else if(typeof authors === 'undefined') {
          authors = [];
        }

        authors.push(userDetails.id);

        story.create(req.body.codename, authors, req.body.entryTime, req.body.visibility, function(err, insertId) {
          if(err) {
            res.send('Error adding story');
          } else {
            res.redirect('/story/' + insertId);
          }
        });
      } else {
        user.allOtherUsers(userDetails.id, function(err, rows) {
          if(err) {
            console.log('Error getting all other users')
            res.redirect('/');
          } else {
            res.render('pages/add_story', {users: rows});
          }
        });
      }
    } else {
      res.redirect('/');
    }
  });
});

module.exports = router;
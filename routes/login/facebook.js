var express = require('express');
var router = express.Router();
var passport = require('passport');
var user = require('../../models/user');

router.get('/', 
  passport.authenticate('facebook', { scope: ['email'], failureRedirect: '/login' }),
  function(req, res) {
  	user.getUser(req, function() {
  		res.redirect('/');
  	});
});

module.exports = router;
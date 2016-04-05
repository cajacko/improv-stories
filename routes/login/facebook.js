/**
 * Authenticate a Facebook login request
 */

var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    user = require('../../models/user');

// Authenticate any requests to '/login/facebook'
router.get('/', passport.authenticate('facebook', {scope: ['email'], failureRedirect: '/login'}), function(req, res) {
    // Get the user/register user if they do not already exist
    user.getUser(req, function(user) {
        // If the request has been successful then redirect to the home page, otherwise return an error
        if(user) {
            res.redirect('/');
        } else {
            // Error saving/logging in user
            res.send('Error logging in/registering user');
        }    
    });
});

module.exports = router;
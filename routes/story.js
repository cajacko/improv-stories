var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
   res.render('pages/story', {page: 'story', title: 'Story Title', userTurn: true, back: '/'});
});

module.exports = router;
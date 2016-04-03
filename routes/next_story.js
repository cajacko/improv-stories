var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {

	var json = ["O", "On", "Onc", "Once", "Once ", "Once u", "Once up", "Once upo", "Once upon ", "Once upon a", "Once upon a ", "Once upon a ti", "Once upon a tim", "Once upon a time", "Once upon a time ", "Once upon a time th", "Once upon a time the", "Once upon a time ther", "Once upon a time there", "Once upon a time there ", "Once upon a time there w", "Once upon a time there wa", "Once upon a time there was", "Once upon a time there was ", "Once upon a time there was a", "Once upon a time there was a "];
	res.json(json);
});

module.exports = router;
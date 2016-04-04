var db = require('../models/db');

exports.create = function(codename, authors, entryTime, visibility, next) {
	db.query('INSERT INTO stories (codename, entry_time, visibility) VALUES (?, ?, ?)', [codename, entryTime, visibility], function(err, result) {

		for (i = 0; i < authors.length; i++) { 
			db.query('INSERT INTO story_authors (story_id, user_id) VALUES (?, ?)', [result.insertId, authors[i]]);
		}

		next(result.insertId);
	});
}

exports.getUserStories = function(userId, next) {
	db.query('SELECT stories.codename, stories.id FROM stories INNER JOIN story_authors ON story_authors.story_id = stories.id WHERE story_authors.user_id = "' + userId + '"', function(err, stories, fields) {
		next(err, stories);
	});
}

exports.saveEntry = function(userId, storyId, entryData, next) {
	var obj = JSON.parse(entryData);

	var lastContent = '';
	var timestamp = new Date().getTime();
	var groupId = userId + '-' + storyId + '-' + timestamp;

	for (i = 0; i < obj.length; i++) {
		if(lastContent != obj[i].content) {
			var bool = 0;

			if((obj.length - 1) == i) {
				bool = 1;
			}

			db.query('INSERT INTO story_entries (story_id, time_stamp, content, user_id, group_id, last_entry) VALUES (?, ?, ?, ?, ?, ?)', [storyId, obj[i].time, obj[i].content, userId, groupId, bool]);
		}

		lastContent = obj[i].content;
	}
}

exports.getStory = function(storyId, next) {
	db.query('SELECT * FROM story_entries WHERE story_id = ? AND last_entry = 1 ORDER BY time_stamp ASC', [storyId], function(err, entries, fields) {
		var filteredEntries = [];

		// Show whole story if the current user was the last user

		for (i = 0; i < entries.length; i++) {
			if((entries.length - 1) != i) {
				filteredEntries.push(entries[i]);
			}
		}

		next(err, filteredEntries);
	});
}

exports.getLastEntry = function(storyId, next) {
	db.query('SELECT group_id FROM story_entries WHERE story_id = ? AND last_entry = 1 ORDER BY time_stamp DESC LIMIT 1', [storyId], function(err, lastEntry, fields) {

		var groupId = lastEntry[0].group_id;

		db.query('SELECT * FROM story_entries WHERE story_id = ? AND group_id = ? ORDER BY time_stamp ASC', [storyId, groupId], function(err, entries, fields) {
			next(err, entries);
		});		
	});
}



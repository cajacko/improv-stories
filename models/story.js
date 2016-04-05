/**
 * Process all the interactions with the database that involve stories
 */

var db = require('../models/db'); // Load the database connection

// Create a new story
exports.create = function(codename, authors, entryTime, visibility, next) {
    // TODO: Validate the values before inserting
    // TODO: Don't allow only one author

    // Add a new story with the specified values 
    db.query('INSERT INTO stories (codename, entry_time, visibility) VALUES (?, ?, ?)', [codename, entryTime, visibility], function(err, result) {
        // If there is an error then pass it on the the callback, otherwise add the story authors
        if(err) {
            next(err); // Pass the error to the callback
        } else {
            // TODO: Group all these queries and call them together so we can deal with errors better

            // For each story author, link them to the story
            for (i = 0; i < authors.length; i++) { 
                db.query('INSERT INTO story_authors (story_id, user_id) VALUES (?, ?)', [result.insertId, authors[i]]);
            }

            next(err, result.insertId); // Perform the callback function whilst passing the error status and story id that was inserted
        }   
    });
}

// Return all the stories the user is an author of
exports.getUserStories = function(userId, next) {
    db.query('SELECT stories.codename, stories.id FROM stories INNER JOIN story_authors ON story_authors.story_id = stories.id WHERE story_authors.user_id = "' + userId + '"', function(err, stories, fields) {
        next(err, stories); // Return the error status and the stories to the callback function
    });
}

// Save a new entry for a story
exports.saveEntry = function(userId, storyId, entryData, next) {
    var obj = JSON.parse(entryData); // Deserialize the entry data

    // TODO: validate all values

    var timestamp = new Date().getTime(); // Get the current time, used for the group ID
    var groupId = userId + '-' + storyId + '-' + timestamp; // Set the group ID

    var lastContent = ''; // Set the default lastContent value, for checking duplicates

    /** 
     * For each item in the entry array, check it's not the 
     * same as the last and then add it to the database
     */
    for (i = 0; i < obj.length; i++) {
        // If the current content is not the same as the last then add it to the database
        if(lastContent != obj[i].content) {
            var lastEntry = 0; // Indicate is the content is the last entry, default to false

            // If the content is the last entry the change the lastEntry var
            if((obj.length - 1) == i) {
                lastEntry = 1;
            }

            // TODO: Group all the queries and perform at the same time so we can check for errors and perform a callback

            // Insert the content into the database
            db.query('INSERT INTO story_entries (story_id, time_stamp, content, user_id, group_id, last_entry) VALUES (?, ?, ?, ?, ?, ?)', [storyId, obj[i].time, obj[i].content, userId, groupId, lastEntry]);
        }

        lastContent = obj[i].content; // Set the last content var to the current content
    }
}

// Get all of the specified story that the current user is allowed to see
// TODO: pass the user id to the function and return the whole story if the current user was the last author, otherwise show all but the last entry
exports.getStory = function(storyId, next) {
    // TODO: validate the values

    // Get all the story entries
    db.query('SELECT * FROM story_entries WHERE story_id = ? AND last_entry = 1 ORDER BY time_stamp ASC', [storyId], function(err, entries, fields) {
        var filteredEntries = []; // Set up an empty array to insert the story content into

        // For each entry in the story add it to the array
        for (i = 0; i < entries.length; i++) {
            // Don't add the entry if it is blank
            if((entries.length - 1) != i) {
                filteredEntries.push(entries[i]);
            }
        }

        next(err, filteredEntries); // Perform the callback function whilst passing the error status and the story entries
    });
}

// Get the last entry of a given story
exports.getLastEntry = function(storyId, next) {
    // Get the last group ID for the given story
    db.query('SELECT group_id FROM story_entries WHERE story_id = ? AND last_entry = 1 ORDER BY time_stamp DESC LIMIT 1', [storyId], function(err, lastEntry, fields) {
        if(err) {
            next(err); // Perform the callback whilst passing the error
        } else {
            // TODO: Check if a result is returned

            var groupId = lastEntry[0].group_id; // Define the group id

            // Get all the content from the last entry in the story, in time order
            db.query('SELECT * FROM story_entries WHERE story_id = ? AND group_id = ? ORDER BY time_stamp ASC', [storyId, groupId], function(err, entries, fields) {
                next(err, entries); // Perform the callback whilst passing the error and entry content
            }); 
        }     
    });
}



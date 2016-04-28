/**
 * Process all the interactions with the database that involve stories
 */

var db = require('../models/db'); // Load the database connection
var general = require('../helpers/general'); // Get the general helper functions
var email = require('../helpers/emails');

// Create a new story
exports.create = function(codename, authors, entryTime, visibility, next) {
    // TODO: Validate the values before inserting
    // TODO: Don't allow only one author

    // Define the query
    var query = '';
    query += 'INSERT INTO stories (codename, entry_time, visibility) ';
    query += 'VALUES (?, ?, ?)';

    // Add a new story with the specified values
    db.query(query, [codename, entryTime, visibility], function(err, result) {
        // If there is an error then pass it on the the callback, otherwise add the story authors
        if (err) {
            next(err); // Pass the error to the callback
        } else {
            // TODO: Group all these queries and call them together so we can deal with errors better

            // For each story author, link them to the story
            for (i = 0; i < authors.length; i++) {
                db.query('INSERT INTO story_authors (story_id, user_id) VALUES (?, ?)', [result.insertId, authors[i]]);
                email.notification('addedToStory', authors[i], result.insertId);
                // TODO: don't send to current user
            }

            next(err, result.insertId); // Perform the callback function whilst passing the error status and story id that was inserted
        }
    });
};

// Return all the stories the user is an author of
exports.getUserStories = function(userId, next) {
    // Define the query
    var query = '';
    query += 'SELECT stories.codename, stories.id ';
    query += 'FROM stories ';
    query += 'INNER JOIN story_authors ';
    query += 'ON story_authors.story_id = stories.id ';
    query += 'WHERE story_authors.user_id = ? ';
    query += 'ORDER BY id DESC';

    db.query(query, userId, function(err, stories) {
        next(err, stories); // Return the error status and the stories to the callback function
    });
};

// Save a new entry for a story
exports.saveEntry = function(userId, storyId, entryData, next) {
    var obj = JSON.parse(entryData); // Deserialize the entry data

    // TODO: validate all values

    var timestamp = new Date().getTime(); // Get the current time, used for the group ID
    var groupId = userId + '-' + storyId + '-' + timestamp; // Set the group ID

    var lastContent = ''; // Set the default lastContent value, for checking duplicates

    var items = []; // Set up a blank array to put in all unique entries

    // For each entry push all unique entries to the items array
    for (i = 0; i < obj.length; i++) {
        // If the current content is not the same as the last then add it to the array
        if (lastContent != obj[i].content) {
            items.push(obj[i]);
        }

        lastContent = obj[i].content; // Set the last content var to the current content
    }

    /**
     * For each item in the entry array add it to the database
     */
    for (i = 0; i < items.length; i++) {
        var lastEntry = 0; // Indicate is the content is the last entry, default to false

        // If the content is the last entry the change the lastEntry var
        if ((items.length - 1) == i) {
            lastEntry = 1;
        }

        // TODO: Group all the queries and perform at the same time so we can check for errors and perform a callback

        // Define the query
        var query = '';
        query += 'INSERT INTO story_entries (story_id, time_stamp, content, user_id, group_id, last_entry) ';
        query += 'VALUES (?, ?, ?, ?, ?, ?)';

        // Insert the content into the database
        db.query(query, [storyId, items[i].time, items[i].content, userId, groupId, lastEntry]);
    }

    // Get all the authors of the story, except the current user, and notify them about the new entry
    var query2 = '';
    query2 += 'SELECT * ';
    query2 += 'FROM story_authors ';
    query2 += 'WHERE story_id = ? AND user_id != ? ';

    db.query(query2, [storyId, userId], function(err, users) {
        if (err) {

        } else {
            // Foreach user send the notification
            for (i = 0; i < users.length; i++) {
                email.notification('yourturn', users[i].user_id, storyId);
            }
        }
    });

    next(true); // TODO: Need to call this when all the queries have run
};

// Get all of the specified story that the current user is allowed to see
// TODO: pass the user id to the function and return the whole story if the current user was the last author, otherwise show all but the last entry
exports.getStory = function(storyId, userId, next) {
    // TODO: validate the values

    // Define the query
    var query = '';
    query += 'SELECT * ';
    query += 'FROM story_entries ';
    query += 'WHERE story_id = ? AND last_entry = 1 ';
    query += 'ORDER BY time_stamp ASC';

    // Get all the story entries
    db.query(query, [storyId], function(err, entries) {
        var filteredEntries = []; // Set up an empty array to insert the story content into
        var currentUserWasLast = false;

        // For each entry in the story add it to the array
        for (i = 0; i < entries.length; i++) {
            // Is the last post the users
            if ((entries.length - 1) == i && entries[i].user_id == userId) {
                currentUserWasLast = true;
            }

            // Don't get the last entry unless it was written by the current user
            if ((entries.length - 1) != i || currentUserWasLast) {
                entries[i].content = general.returnStoryWithBr(entries[i].content); // Remove new lines with br tags
                filteredEntries.push(entries[i]); // Add the elements to the array
            }
        }

        // TODO: return the last user as a param as well, and handle if was last user

        // Get the story details
        var query = '';
        query += 'SELECT * ';
        query += 'FROM stories ';
        query += 'WHERE id = ? ';
        query += 'LIMIT 1';

        // Perform the query
        db.query(query, [storyId], function(err, story) {
            if (err) {
                next(err);
            } else {
                // TODO: if no story of that id, put this query before getting posts.

                // Perform the callback function whilst passing the error status and the story entries
                next(err, filteredEntries, story[0], currentUserWasLast);
            }
        });
    });
};

// Get the last entry of a given story
exports.getLastEntry = function(storyId, next) {
    // Define the query
    var query = '';
    query += 'SELECT group_id ';
    query += 'FROM story_entries ';
    query += 'WHERE story_id = ? AND last_entry = 1 ';
    query += 'ORDER BY time_stamp DESC ';
    query += 'LIMIT 1';

    // Get the last group ID for the given story
    db.query(query, [storyId], function(err, lastEntry) {
        if (err) {
            next(err); // Perform the callback whilst passing the error
        } else {
            // TODO: Check if a result is returned

            // If there is a last entry then get it. Otherwise indicate that there is no entry
            if (lastEntry.length) {
                var groupId = lastEntry[0].group_id; // Define the group id

                var query = '';
                query += 'SELECT * ';
                query += 'FROM story_entries ';
                query += 'WHERE story_id = ? AND group_id = ? ';
                query += 'ORDER BY time_stamp ASC';

                // Get all the content from the last entry in the story, in time order
                db.query(query, [storyId, groupId], function(err, entries) {
                    if (err) {
                        // TODO
                    } else {
                        // TODO: if no results
                        var userId = entries[0].user_id;

                        var query = '';
                        query += 'SELECT * ';
                        query += 'FROM users ';
                        query += 'WHERE id = ?';

                        // Get all the content from the last entry in the story, in time order
                        db.query(query, [userId], function(err, users) {
                            if (err) {

                            } else {
                                // TODO: if no result
                                next(err, entries, users[0]); // Perform the callback whilst passing the error and entry content
                            }
                        });
                    }
                });
            } else {
                next(false, 'noEntries');
            }
        }
    });
};

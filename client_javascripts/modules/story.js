/**
 * Play, save and display storires
 */

var $ = require('jquery'); // Get jquery
var general = require('../../helpers/general'); // Get the general helper functions

// TODO: Handle the first entry

/**
 * This script does the following:
 * 1 - Gets the last entry for the story - takeTurn()
 * 2 - Plays that entry out to the user - playLastStory()
 * 3 - Then lets the user start adding an entry to the story - startWriting()
 * 4 - When the timer runs out the entry then gets saved and the page refreshes - setTimer(), saveEntry()
 * 5 - Support functions for scrolling and interacting with the story nav
 */
takeTurn(); // Initialise the process

// Get the story id
var storyId = window.location.pathname;
storyId = storyId.split('/');
storyId = storyId[2];

/********************************************
* 1 - TAKE TURN                             *
********************************************/
/**
 * Initialise the take turn button.
 *
 * When clicked set the edit mode and play the last story.
 */
function takeTurn() {
    // Only register the click function when the document is loaded
    $(document).ready(function() {
        // Set up the click handler
        $('button#storyAction').click(function() {
            // Get the next story
            $.ajax({
                url: '/next-story',
                dataType: 'json',
                type: 'POST',
                data: {action: 'nextEntry', storyId: storyId}
            })
            .done(function(data) {
                // If the ajax call is successful
                // TODO: Check the the data returned is valid, if not then tell the user

                $('#storyAction').hide(); // Hide the action bar
                $('body').addClass('editMode'); // Set the edit mode

                /**
                 * If the story has just started then let the author
                 * start writing straight away. Otherwise show the
                 * previous story
                 */
                if (data.newStory) {
                    startWriting();
                } else {
                    // Replace the storyAction button with a span indicating the user who is writing
                    $('#storyStatus').html('Last entry from ' + data.user.display_name);
                    playLastStory(data.entries); // Playe the story
                }
            })
            .fail(function() {
                // If the ajax called failed

                // TODO: Tell the user to try again
            });
        });
    });
}

/********************************************
* 2 - PLAY THE LAST ENTRY                   *
********************************************/
/**
 * Play the last story and then let the user start writing
 */
function playLastStory(story) {
    // TODO: add a countdown at end of cursor
    // Scroll to the bottom of the story and then allow editing
    scrollToBottom(function() {
        // Set a brief timeout, as it feels nicer
        setTimeout(function() {
            var count = 0; // Set the default count, in order to get each array item from the story

            /**
             * Play the story
             *
             * Loop over each part of the story, displaying it in
             * #lastentry and then run the startWriting function
             * when the story is over.
             */
            var playStory = setInterval(function() {
                // If there is more story
                if (story.length > count) {
                    var text = story[count].content; // Get the next content
                    text = general.returnStoryWithBr(text); // Turn line breaks into <br> elements
                    $('#lastEntry').html(text); // Replace the lastEntry content
                    count++;
                } else {
                    // The story has ended so...
                    clearInterval(playStory); // Clear the interval
                    $('#lastEntry').attr('id', ''); // Remove the last entry id, to indicate the entry is a normal story item
                    startWriting(); // Allow the user to start adding an entry
                }
            }, 75);
        }, 500);
    });
}

/********************************************
* 3 - START WRITING AN ENTRY                *
********************************************/
var interval;
var timeout = $('#story').data('entry-time') * 1000; // Set the amount of time that the user can write an entry for
var timeOn = false; // Indicate that the timer is not on yet
var story = []; // Initialise a blank array for the new entry to go into
var lastKey; // Store the last keypress so we can remove multiple line breaks

/**
 * Check if the needle is in the haystack.
 *
 * Used to check if a disabled key has been entered
 */
var contains = function(needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;

    if (!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1;
            var index = -1;

            for (i = 0; i < this.length; i++) {
                var item = this[i];

                if ((findNaN && item !== item) || item === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle) > -1;
};

// Define the disabled keys
var disabledKeys = [
    40, // Down
    38, // Up
    39, // Right
    37, // Left
    9, // Tab
];

// Show the tap screen to continue screen
function showTapMessage() {
    // If the message isn't already showing then show it
    if (!$('#tapMessage').length) {
        var div = '';
        div += '<div id="tapMessage" class="tapMessage"><div><div>'; // Open the divs
        div += '<p>Tap the screen!</p><p>Your go has started!</p><p id="tapMessageTime"></p>'; // Define the message
        div += '</div></div></div>'; // close the divs

        $('main').append(div); // Show the message
    }
}

/**
 * Allow the user to start writing a new entry
 */
function startWriting() {
    setTimer(); // Stop content entry after the designated time

    $('#currentEntry').css('display', 'inline');

    /**
     * Focus on the textarea whenever a user clicks on the story.
     *
     * This is useful in ensuring that if the textarea loses focus
     * for any reason you can still get back on it. It could be
     * useful to have a message indicating that the textarea has
     * lost focus.
     *
     * This is also used for iOS, as we can't automatically focus
     * on the textarea after a timeout on iOS.
     */
    $('main').on('click.storyFocus', function() {
        $('#contentEditText').focus();
        $('#tapMessage').remove();
    });

    var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream; // If iOS
    /**
     * If the user is on an iOS device show the tap to continue
     * screen, as iOS does not let you programatically focus
     * after a timeout.
     */
    if (iOS) {
        showTapMessage(); // Show the tap message
    }

    /**
     * Make sure the textarea is empty, enable it and then focus on it.
     *
     * The focus does not work on iOS, as iOS only lets you focus on an
     * element directly after a user interaction, it won't focus if
     * there is a timeout inbetween action and focus.
     */
    $('#contentEditText').html('').prop('disabled', false).focus();

    /**
     * When content is being entered into the textarea check if it is
     * allowed and add to the story if it is, ignore the action if it
     * isn't allowed.
     */
    $('#contentEditText').on('keydown', function(event) {
        /**
         * If the time has run out, or the key is not allowed,
         * or multiple line breaks are being entered then ignore
         * this action
         */
        if (!timeOn || contains.call(disabledKeys, event.keyCode) || (lastKey == 13 && event.keyCode == 13)) {
            event.preventDefault();
        } else {
            lastKey = event.keyCode; // Indicate the last valid key that was pressed
        }
    }).bind('paste', function(event) {
        // Ignore all paste actions
        event.preventDefault();
    }).on('keyup', function() {
        /**
         * This will fire only if the key has been allowed
         *
         * If there is still time to write the entry then append the whole
         * entry to the story array.
         *
         * Each item in the story array will be the whole content of the
         * entry at the point that key was pressed. This makes it easier
         * to play the story back than saving each keypress individually,
         * as we don't need to replicate backspace actions. It is a more
         * accurate representation of the entry at each stage.
         */
        if (timeOn) {
            var text = $(this).val(); // Get the content of the textarea
            addToStory(text); // Add the content to the story array

            var content = story[story.length - 1].content; // Get the last item in the story array
            content = general.returnStoryWithBr(content); // Replace newlines with html elements

            $('#currentEntry').html(content); // Show the new entry content
        }
    });
}

// Add content to the story array, with a timestamp of when it occured.
function addToStory(content) {
    var now = new Date(); // Get now date
    story.push({time: now.getTime(), content: content}); // Add the content with the timestamp
}

/********************************************
* 4 - END ENTRY AND SAVE IT                 *
********************************************/
/**
 * Set the timer for adding an entry.
 *
 * Show the user the time they have left and stop content
 * entry and save the entry when the time is up
 */
function setTimer() {
    clearInterval(interval); // Make sure no other versions of the timer are active
    var intervalPeriod = 10; // Set the time between showing the updated time left to the user
    var time = timeout; // Set the initial time the user has, this will keep decreasing so we want it in this seperate var
    timeOn = true; // Indicate the timer has started

    $('#storyStatus').html('Start writing, you have <span id="time">' + (time / 1000) + '</span>s left!'); // Update the story status for the user

    /**
     * Update the time left for the user and when the
     * time is up disable the content entry, put the
     * interface out of edit mode and save the entry.
     */
    interval = setInterval(function() {
        time = time - intervalPeriod; // Update the time

        // If there is no more time then left...
        if (time <= 0) {
            $('#storyAction').text('Done'); // Indicate to the user that the content entry is done
            timeOn = false; // Indicate that the timer is not on anymore
            $('#contentEditText').blur().prop('disabled', true); // Lose focus and disable the textarea
            $('body').removeClass('editMode'); // Remove the editMode
            $('main').off('.storyFocus'); // Remove the click function that would focus on the textarea

            clearInterval(interval); // Clear the timer
            saveEntry(story); // Save the entry
        } else {
            /**
             * If the textarea looses focus during the timer then show
             * the tap to edit screen.
             */
            if (!$('#contentEditText').is(':focus')) {
                showTapMessage();
            }

            var currentSeconds = time / 1000; // Get the time in seconds
            currentSeconds = parseFloat(Math.round(currentSeconds * 100) / 100).toFixed(2); // Parse the time to 2 decimal places
            $('#time, #tapMessageTime').text(currentSeconds); // Show the updated time
        }
    }, intervalPeriod);
}

// Save the entry
function saveEntry(entry) {
    entry = JSON.stringify(entry); // Serialize the array to POST

    $.ajax({
        url: '/save-entry',
        type: 'POST',
        dataType: 'json',
        data: {story: entry, action: 'saveEntry', storyId: storyId},
    })
    .done(function() {
        // The data was successfully posts

        /**
         * TODO: check the response to see if the story was successfully
         * saved to the database, if not then try again, then tell the
         * user if failed again.
         */

        location.reload(true);
    })
    .fail(function() {
        // The ajax request failed

        // TODO: Try to save again then Indicate to the user that the story could not be saved and that they should try again
    });
}

/********************************************
* 5 - HELPER FUNCTIONS                      *
********************************************/
// Scroll to the bottom of the story
function scrollToBottom(next) {
    $('main').animate({scrollTop: $('#mainWrap').outerHeight()}, 'slow', next());
}

// function scrollToTop() {
//  $('#scrollToTop').click(function() {
//      $('#addStoryWrap').animate({ scrollTop: 0 }, 'slow');
//      return false;
//  });
// }

// function scrollToBottomButton() {
//  $('#scrollToBottom').click(function() {
//      scrollToBottom();
//  });
// }

// When on the story page, prevent backspace from navigating to the previous page
$(document).on('keydown', function(event) {
    // If the key was backspace and the textarea isn't focussed then do nothing
    if (event.keyCode == 8 && !$('#contentEditText').is(':focus')) {
        event.preventDefault();
    }
});

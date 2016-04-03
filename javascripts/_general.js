takeTurn();

function takeTurn() {
	$(document).ready(function() {
		$('button#storyAction').click(function() {
			
			$.ajax({
				url: '/next-story',
				dataType: 'json'
			})
			.done(function(data) {
				console.log(data);
				$('body').addClass('editMode');
				playLastStory(data);
			})
			.fail(function() {
				console.log("error");
			})
			.always(function() {
				console.log("complete");
			});
			
		});
	});
}

function playLastStory(story) {
	$('#story').append('<div id="lastEntry"></div>');

	var count = 0;

	var playStory = setInterval(function() {
		if(story.length > count) {
			var text = story[count];
			$('#lastEntry').html(text);
			count++;
		} else {
			clearInterval(playStory);
			$('#lastEntry').attr('id', '');
			startWriting();
		}
		
	}, 75);
}

var timer, interval, playStory;
var timeout = 20000;
var timeOn = false;
// var timeOn = true;
var story = [];

var contains = function(needle) {
	// Per spec, the way to identify NaN is that it is not equal to itself
	var findNaN = needle !== needle;
	var indexOf;

	if(!findNaN && typeof Array.prototype.indexOf === 'function') {
		indexOf = Array.prototype.indexOf;
	} else {
		indexOf = function(needle) {
			var i = -1, index = -1;

			for(i = 0; i < this.length; i++) {
				var item = this[i];

				if((findNaN && item !== item) || item === needle) {
					index = i;
					break;
				}
			}

			return index;
		};
	}

	return indexOf.call(this, needle) > -1;
};

var disabledKeys = [
	40, // Down
	38, // Up
	39, // Right
	37, // Left
	9, // Tab
];

function startWriting() {
	$('#story').append('<div id="currentEntry"></div>');
	setTimer();
	// Notify user to start writing



	$('html').on("click.storyFocus", function() {
		$('#contentEditText').focus();
	});

	$('#contentEditText').html('').prop('disabled', false).focus();

	// if(!$('#contentEditText').is(':focus')) {
	// 	$('#status').prepend('<div>Touch the screen to start</div>');
	// }

	$('#contentEditText').on('keydown', function(event) {
		if(!timeOn || contains.call(disabledKeys, event.keyCode)) {
			event.preventDefault();
		}
	}).bind('paste', function(event) {
		event.preventDefault();
	}).on('keyup', function() {
		if(timeOn) {
			var text = $(this).val();
			addToStory(text);

			var content = story[story.length -1].content;
			content = content.replace(/(?:\r\n|\r|\n)/g, '<br><br>');

			$('#currentEntry').html(content);
		}
	});
}

function addToStory(content) {
	var now = new Date();
	story.push({time: now.getTime(), content: content});
}

function setTimer() {
	clearInterval(interval);
	var intervalPeriod = 10;
	var time = timeout;
	timeOn = true;

	interval = setInterval(function() {
		time = time - intervalPeriod;

		if(time <= 0) {
			// $('#time').text('Done');
			timeOn = false;
			$('#contentEditText').blur().prop('disabled', true);
			// $('#contentEdit').removeClass('active');
			$('html').off(".storyFocus");

			setTimeout(function() {
				clearInterval(interval);
			}, intervalPeriod);
		} else {
			var currentSeconds = time / 1000;
			currentSeconds = parseFloat(Math.round(currentSeconds * 100) / 100).toFixed(2); 
			currentSeconds = currentSeconds + 's';

			console.log(currentSeconds);
// 
			// $('#time').text(currentSeconds);
		}
	}, intervalPeriod);
}

// function scrollToTop() {
// 	$('#scrollToTop').click(function() {
// 		$('#addStoryWrap').animate({ scrollTop: 0 }, 'slow');
// 		return false; 
// 	});
// }

// function scrollToBottom() {
// 	$('#scrollToBottom').click(function() {
// 		$('#addStoryWrap').animate({ scrollTop: $('#story').outerHeight() }, 'slow');
// 		return false; 
// 	});
// }
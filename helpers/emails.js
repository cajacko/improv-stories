var nodemailer = require('nodemailer');
var config = require('../config');
var db = require('../models/db'); // Load the database connection

function sendEmail(to, subject, text, html) {
    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport(config.email);

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: '"Improv Stories" <charlie@charliejackson.com>', // sender address
        // to: to, // list of receivers
        to: 'charlie@charliejackson.com',
        subject: subject, // Subject line
        text: text, // plaintext body
        html: html // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            return console.log(error);
        }

        console.log('Message sent: ' + info.response);
    });
}

exports.notification = function(type, toUserId, storyId) {
    var query = '';
    query += 'SELECT * ';
    query += 'FROM users ';
    query += 'WHERE id = ?';

    // Get all the content from the last entry in the story, in time order
    db.query(query, toUserId, function(err, users) {
        if (err) {

        } else {
            var storyUrl = 'http://stories.supercouth.co.uk/stories/' + storyId;
            var userEmail = users[0].email;
            var subject;
            var text;
            var html;

            if (type == 'addedToStory') {
                subject = 'Improv Stories - New story!';
                text = 'You have been added to a new story on Improv Stories. Take your turn here: ' + storyUrl;
                html = 'You have been added to a new story on Improv Stories. Take your turn here: <a href="' + storyUrl + '">' + storyUrl + '</a>';
            } else if (type == 'yourturn') {
                subject = 'Improv Stories - Your turn!';
                text = 'It is your turn to carry on the story!. Take your turn here on Improv Stories: ' + storyUrl;
                html = 'It is your turn to carry on the story!. Take your turn here on Improv Stories: <a href="' + storyUrl + '">' + storyUrl + '</a>';
            }

            sendEmail(userEmail, subject, text, html);
        }
    });
};

/**
 * This file provides general function to be
 * used by client and server side scripts
 */

// Replace line breaks with >br> elements
exports.returnStoryWithBr = function(content) {
    content = content.replace(/\n\s*\n/g, '\n'); // Turn multiple line breaks into single ones
    content = content.replace(/(?:\r\n|\r|\n)/g, '<br><br>'); // Replace newlines with html
    return content; // Return the content
};

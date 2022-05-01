import '../imports/api/courses.js';
import '../imports/api/users.js';
import '../imports/api/lessons.js';
import '../imports/api/server/braincert.js'; //./imports/api/server/braincert.js


Meteor.startup(function () {
process.env.MAIL_URL = 'smtps://aristotle%40flessibilita.pro:v9jBy9D4c17p@smtp.zoho.com:465';
});

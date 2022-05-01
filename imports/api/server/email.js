import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { HTTP } from 'meteor/http';

import { Lessons } from '/imports/api/lessons.js';
import { Courses } from '/imports/api/courses.js';
import { Users } from '/imports/api/users.js';

// Connect SparkPost
const api_sparkpost = Meteor.settings.sparkpost.api ;
const SparkPost = require('sparkpost');
const client = new SparkPost(api_sparkpost);

// Find User in Lesson.User
function search(nameKey, myArray){
  console.log("starting search for "+ nameKey)
  for (var i=0; i < myArray.length; i++) {
    console.log(nameKey, myArray[i].user_id);
    if (myArray[i].user_id.toString() == nameKey.toString()) {
        return myArray[i];
    }
    console.log("******************")
  }
}

// Send email via SparkPost API
function sendEmail (recipient, subject, html) {
  client.transmissions.send({
      options: {
        sandbox: false,
        open_tracking: false,
        click_tracking: false
      },
      content: {
        from: 'hi@aristotle.fless.pro',
        subject: subject,
        html: html
      },
      recipients: [
        {address: recipient}
      ]
    })
    .then(data => {
      console.log('Mail to ' + recipient + ' successfully sent');
      console.log(data);
    })
    .catch(err => {
      console.log('Whoops! Something went wrong');
      console.log(err);
  });
}

// In a server-only file, for example /imports/server/mmr.js
export const emailNotification = {
  // API call to send emails to all users in a given lesson
  notifyUsers (lesson_id) {
    const lesson = Lessons.findOne(lesson_id);
    const users = Courses.findOne(lesson.course).users;

    usersNumber = users.length;

    for (var i = 0; i < usersNumber; i++) {
        if (users[i]["user_status"] > 0) {
          currentUser = Users.findOne(users[i]["user_id"]);
          recipient = currentUser.email ;
          subject = "Your personal link to " + lesson.title + " - Fless";
          time = moment(lesson.from).format('HH:mm') ;
          date = moment(lesson.from).format('MMMM Do') ;
          user_url = search(users[i]["user_id"], lesson.users).user_url;
          html = '<html><body><p>Hey '+currentUser.firstname+',</p><p>'+lesson.title+' starts on '+date+' at ' + time + ' Moscow. Here is <a href='+user_url+'>your personal link</a> to the session.</p></br><p>Best,</p><p>Aristotle from Fless</p></body></html>'
          sendEmail(recipient, subject, html)
          //console.log("EMAIL: ",recipient, subject, html)
        }
    }
  }
}

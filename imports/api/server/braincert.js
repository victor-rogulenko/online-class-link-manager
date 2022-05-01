import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { HTTP } from 'meteor/http';

import { Lessons } from '/imports/api/lessons.js';
import { Courses } from '/imports/api/courses.js';
import { Users } from '/imports/api/users.js';

const api_braincert = Meteor.settings.braincert.api ;

// In a server-only file, for example /imports/server/mmr.js
export const Braincert = {
  // API call to create a new virtual classroom in Braincert
  insertLesson (lesson) {
    if (!lesson.title || !lesson.from || !lesson.to) {
      throw new Meteor.Error('Please complete all fields');
    }

    data = {
            'title': lesson.title,
            'timezone': '54',
            'start_time': moment(lesson.from).format('hh:mmA'),
            'end_time': moment(lesson.to).format('hh:mmA'),
            'date' : moment(lesson.from).format('YYYY-MM-DD'),
            'record' : '2',
            'isRegion' : '6',
            'isVideo' : '0'
    }


    var url = 'https://api.braincert.com/v2/schedule?apikey=' + api_braincert ;

    var braincertClassId = 0;

    try {
      const resultString= HTTP.call("POST", url, {params:data});
      const result = JSON.parse(resultString.content);
      console.log(result.content);
      braincertClassId = result["class_id"];
    } catch (e) {
      // Got a network error, timeout, or HTTP error in the 400 or 500 range.
      console.log(e);
      return (0);
    }

    var newLesson_id = Lessons.insert(
      {"title":lesson.title,
      "course":lesson.course,
      "from": lesson.from,
      "to": lesson.to,
      "created": new Date(),
      "lesson_status": 1,
      "braincert_id" : braincertClassId},
      function(err){
        if (err) {
          throw new Meteor.Error(err.message)
        }
      }
    );

    Courses.update(
      { "_id" : lesson.course},
      { $push : {"lessons" : {"lesson_id":newLesson_id, "lesson_status":1, "created":new Date()}} });

    return (newLesson_id);
  },


  // API call to remove a virtual classroom from Braincert
  removeLesson (lesson_id, course_id) {
    lesson = Lessons.findOne(lesson_id);

    data = {'cid': lesson.braincert_id};

    var url = 'https://api.braincert.com/v2/removeclass?apikey=' + api_braincert ;

    var braincertClassId = 0;

    try {
      const resultString= HTTP.call("POST", url, {params:data});
      const result = JSON.parse(resultString.content);
      console.log(result);
    } catch (e) {
      // Got a network error, timeout, or HTTP error in the 400 or 500 range.
      console.log(e);
    }

    // The lesson status is marked as 0 - "removed" for our purposes
    Lessons.update(
      { "_id" : lesson_id},
      { $set : {"lesson_status":0, "updated":new Date()}});

    // Delete the lesson from the course
    Courses.update(
          { "_id" : course_id},
          { $pull : {lessons : {lesson_id: lesson_id}}},
      function (error) {
        if (error) {
          throw new Meteor.Error(error.reason);
        }
    });
  },

  // API call to add a user to the virtual classroom
  joinLesson (lesson_id, user_id, user_role) {
    lesson = Lessons.findOne(lesson_id);
    user = Users.findOne(user_id);

    userName = user.firstname + " " + user.lastname;
    var isTeacher = 0;
    if (user_role > 1) {
      isTeacher = 1;
    };


    data = {
            'class_id': lesson.braincert_id,
            'userId': user_id._str,
            'userName': userName,
            'isTeacher': isTeacher,
            'lessonName' : lesson.title,
            'courseName' : 'FLESS',
            'isVideo' : '1'
    }

    var url = 'https://api.braincert.com/v2/getclasslaunch?apikey=' + api_braincert;
    var personalURL = '';

    try {
      console.log (data)
      const resultString= HTTP.call("POST", url, {params:data});
      const result = JSON.parse(resultString.content);
      personalURL = result['encryptedlaunchurl'];
    } catch (e) {
      // Got a network error, timeout, or HTTP error in the 400 or 500 range.
      console.log(e);
    }
    var personalURLFless = personalURL.replace("api.braincert.com", "live.fless.pro");
    console.log(userName, user_id, personalURLFless);

    // The lesson status is marked as 0 - "removed" for our purposes
    Lessons.update(
      { "_id" : lesson_id},
      { $push : {"users" : {"user_id":user_id, "user_url": personalURLFless, "created":new Date()}} });
  }
}

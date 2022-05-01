import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Courses } from '../api/courses.js';

export const Lessons = new Mongo.Collection('Lessons', {idGeneration : 'MONGO'});

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('lessons', function lessonsPublication() {
    return Lessons.find();
  });
}


// Method for calling server-side scripts
export const insertBraincertLesson = new ValidatedMethod({
  name: 'lessons.insert',
  validate: new SimpleSchema({
    title: { type: String },
    from: { type: Date },
    to: { type: Date },
    course: { type: Meteor.Collection.ObjectID },
  }).validator(),
  run(lesson) {
    console.log("validation complete");
    if (!this.isSimulation) {
      console.log('not simulation');
      const { Braincert } = require('/imports/api/server/braincert.js'); //change to /imports/api/server/braincert.js
      const newLesson_id = Braincert.insertLesson(lesson);
      const users = Courses.findOne(lesson.course).users;

      usersNumber = users.length;

      for (var i = 0; i < usersNumber; i++) {
          console.log (newLesson_id, users[i]["user_id"], users[i]["user_status"]);
          if (users[i]["user_status"] > 0) {
            Braincert.joinLesson(newLesson_id, users[i]["user_id"], users[i]["user_status"]);
          }
      }
    }
  },
});

export const removeBraincertLesson = new ValidatedMethod({
  name: 'lessons.remove',
  validate: new SimpleSchema({
    lesson_id: { type: Meteor.Collection.ObjectID },
    course_id: { type: Meteor.Collection.ObjectID },
  }).validator(),
  run(args) {
    console.log("validation complete");
    var result = 0;
    if (!this.isSimulation) {
      console.log('not simulation');
      const { Braincert } = require('/imports/api/server/braincert.js');
      Braincert.removeLesson(args.lesson_id, args.course_id);
    }
  },
});


export const notifyBraincertUsers = new ValidatedMethod({
  name: 'lessons.notify',
  validate: new SimpleSchema({
    lesson_id: { type: Meteor.Collection.ObjectID },
  }).validator(),
  run(args) {
    console.log("validation complete");
    var result = 0;
    if (!this.isSimulation) {
      console.log('not simulation');
      const { emailNotification } = require('/imports/api/server/email.js');
      emailNotification.notifyUsers(args.lesson_id, args.course_id);
    }
  },
});

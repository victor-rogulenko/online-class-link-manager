import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Users } from '../api/users.js';
import { Lessons } from '../api/lessons.js';

export const Courses = new Mongo.Collection('Courses', {idGeneration : 'MONGO'});

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('courses', function coursesPublication() {
    return Courses.find();
  });
}

Meteor.methods({
  'courses.insert'(args) {
    if (!args.title || !args.group || !args.from || !args.to) {
      throw new Meteor.Error('Please complete all fields');
    }

    var newArgs = args ;
    newArgs['created'] = new Date () ;
    newArgs['updated'] = new Date () ;
    newArgs['from'] = new Date (args.from) ;
    newArgs['to'] = new Date (args.to) ;

    Courses.insert(newArgs);

    return ('Course successfully added to the database')
  },

  'courses.remove'(courseId) {
    Courses.remove({"_id":courseId}, {justOne:"True"});
    return ("Successfully deleted the course")
  },

  'courses.add_user'(courseId, userEmail, userRole) {
    var currentUser = Users.findOne({"email":userEmail});

    if (! currentUser) {
      throw new Meteor.Error(error.reason);
    }

    var alreadyExists = 0;
    // Try to update the user first (if already in this course)
    Courses.update(
          { "_id" : courseId, "users.user_id" : currentUser._id},
          { $set : {"users.$.user_status":userRole, "users.$.updated":new Date()}},
      function (error, response) {
        if (!error) {
          alreadyExists = response ;
        }
    });

    // If the user is not in the course yet, add them
    if (alreadyExists < 1) {
      Courses.update(
        { "_id" : courseId, "users.user_id":{$ne: currentUser._id}},
        { $push : {"users" : {"user_id":currentUser._id, "user_status":userRole, "created":new Date()}} },
        function (error, response) {
          if (error) {
            throw new Meteor.Error(error.reason);
          }
      });
    }
    return ('Successfully added user to the course');
  },

  'courses.expel_user'(userId, cId){
    var courseId = new Mongo.ObjectID(cId)
    console.log (userId, courseId)
    // Change status rather than delete
    Courses.update(
      { "_id" : courseId, "users.user_id" : userId},
      { $set : {"users.$.user_status":0, "users.$.updated":new Date()}}
    );
  },
});

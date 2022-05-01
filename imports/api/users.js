import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Users = new Mongo.Collection('Users', {idGeneration : 'MONGO'});

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('users', function usersPublication() {
    return Users.find();
  });
}

Meteor.methods({
  'users.insert'(args) {
    if (!args.email) {
      throw new Meteor.Error('Please provide user email');
    }

    if (!args.user_status || args.user_status < 1 || args.user_status > 3) {
      throw new Meteor.Error('Incorrect user status. Should be 1 for student, 2 for admin, or 3 for mentor');
    }

    var currentUser = Users.findOne({'email':args.email});
    var newArgs = args ;
    newArgs['updated'] = new Date () ;

    if (currentUser) {
      Users.update({'_id':currentUser._id}, {$set: newArgs} )
      return ('User already exists. User data is updated')
    } else {
      newArgs['created'] = new Date () ;
      Users.insert(newArgs)
      return ('New user is created successfully')
    }

  },
});

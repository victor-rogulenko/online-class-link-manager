import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import { Users } from '../api/users.js';
import { Courses } from '../api/courses.js';
import { Lessons } from '../api/lessons.js';

//  Lesson component - represents a single lesson
export default class Lesson extends Component {
  notifyUsersByEmail() {
    const course_id = new Mongo.ObjectID(this.props.course_id);
    var args = {};
    args["lesson_id"] = this.props.lesson_id;
    Meteor.call('lessons.notify', args, function(error, result){
      if (error) {
        alert(error.reason);
      };
    });
  }

  deleteThisLesson() {
    const course_id = new Mongo.ObjectID(this.props.course_id);
    var args = {};
    args["lesson_id"] = this.props.lesson_id;
    args["course_id"] = course_id;
    Meteor.call('lessons.remove', args, function(error, result){
      if (error) {
        alert(error.reason);
      };
    });
  }

  render() {
    var currentLesson = Lessons.findOne(this.props.lesson_id);

    var fromts = currentLesson.from,
        from_date = (moment(fromts).isValid()) ? new moment(fromts).format('MMMM Do YYYY HH:mm') : "..";
    var tots = currentLesson.to,
        to_date = (moment(tots).isValid()) ? new moment(tots).format('HH:mm') : "..";

    var from_to_str = (moment(tots).isValid()) ? String(from_date.toString()+" - "+to_date.toString()) : "";

    return (
      <li className="small">
        <strong>{currentLesson.title}</strong>
        <button className="delete" onClick={this.deleteThisLesson.bind(this)}>
          &times;
        </button>
        <button className="delete" onClick={this.notifyUsersByEmail.bind(this)}>
          send emails
        </button>
        <ul>
          <li className="small-no-symbol">
            {from_to_str}
          </li>
        </ul>
      </li>
    );
  }
}

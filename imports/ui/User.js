import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import { Users } from '../api/users.js';
import { Courses } from '../api/courses.js';

//  User component - represents a single user
export default class User extends Component {
  expelThisUser() {
    //console.log(this.props.user.user_id)
    Meteor.call('courses.expel_user', this.props.user_id, this.props.course_id);
  }

  renderCourses(props) {
    var fromts = props.course.from,
        from_date = (moment(fromts).isValid()) ? new moment(fromts).format('MMMM Do YYYY') : "..";
    var tots = props.course.to,
        to_date = (moment(tots).isValid()) ? new moment(tots).format('MMMM Do YYYY') : "..";

    var from_to_str = (moment(tots).isValid()) ? String(": " + from_date.toString()+" - "+to_date.toString()) : "";

    return (
      <li className={props.classStyle}> {props.course.title} {props.course.group} {from_to_str}</li>
    )
  }

  // Render separate page dedicated to users
  renderFull() {
    var currentUser = Users.findOne(this.props.user_id);
    var currentUserCourses = Courses.find({'users' : {$elemMatch : {'user_id':this.props.user_id, 'user_status': {"$gt" : 0}}}}).fetch();
    var deletedUserCourses = Courses.find({'users' : {$elemMatch: {'user_id':this.props.user_id, 'user_status': 0}}}).fetch();

    var currentUserCoursesRendered = currentUserCourses.map((course) =>
      <this.renderCourses course={course} key={course._id} classStyle = 'small'/>
    );

    var deletedUserCoursesRendered = deletedUserCourses.map((course) =>
      <this.renderCourses course={course} key={course._id} classStyle = 'linethrough'/>
    );

    return (
      <li>
        <header> <strong>{currentUser.firstname} {currentUser.lastname} </strong> </header>
        <ul className="small">
          <li className="small"> <strong>email:</strong> {currentUser.email} </li>
          <li className="small"> <strong>gmail:</strong> {currentUser.gmail} </li>
          <li className="small"> <strong>phone:</strong> {currentUser.phone} </li>
          <li className="small"> <strong>background:</strong> {currentUser.background} </li>
          <li className="small"> <strong>telegram:</strong> {currentUser.tgchat} </li>
        </ul>
        <h2> Courses : </h2>
        <ul className="small">
          {currentUserCoursesRendered}
          {deletedUserCoursesRendered}
        </ul>
      </li>
    );
  }

  // Render users in a course
  renderPartial() {
    var currentUser = Users.findOne(this.props.user_id);
    if (this.props.user_status == 3) {
      var role = "Mentor: ";
    } else if (this.props.user_status == 2) {
      var role = "Admin: ";
    } else {
      var role = "";
    }


    // If the user is removed (has status 0), put a line through
    var classStyle = 'small';
    if (this.props.user_status == 0) {
      var classStyle = 'linethrough'
    }

    return (
      <li className={classStyle}>
        <button className="delete" onClick={this.expelThisUser.bind(this)}>
          &times;
        </button>
        <strong>{role}</strong>{currentUser.lastname} {currentUser.firstname} ({currentUser.email})
      </li>
    );
  }

  render() {
    if (this.props.course_id == undefined) {
      var renderContent = this.renderFull()
    } else {
      var renderContent = this.renderPartial()
    }
    return (
      <div className="container">
        {renderContent}
      </div>
    );
  }
}

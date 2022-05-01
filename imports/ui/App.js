import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { withTracker } from 'meteor/react-meteor-data';

import { Courses } from '../api/courses.js';
import { Lessons } from '../api/lessons.js';
import { Users } from '../api/users.js';

import Course from './Course.js';
import Lesson from './Lesson.js';
import User from './User.js';
import Form from './Form.js';

// Global input forms appearing at the top of the page
const InputForms = [
  {
    'pageType' : 'Courses',
    'pageNum' : 0,
    'fields' : [
      {'ref':'title','type':'text'},
      {'ref':'group','type':'text'},
      {'ref':'from','type':'date'},
      {'ref':'to','type':'date'},
    ],
  },
  {
    'pageType' : 'Students',
    'pageNum' : 1,
    'fields' : [
      {'ref':'firstname','type':'text'},
      {'ref':'lastname','type':'text'},
      {'ref':'email','type':'email'},
      {'ref':'gmail','type':'gmail'},
      {'ref':'phone','type':'phone'},
      {'ref':'background','type':'text'},
    ],
  },
  {
    'pageType' : 'Mentors/Admins',
    'pageNum' : 2,
    'fields' : [
      {'ref':'firstname','type':'text'},
      {'ref':'lastname','type':'text'},
      {'ref':'email','type':'email'},
      {'ref':'gmail','type':'gmail'},
      {'ref':'phone','type':'phone'},
      {'ref':'user_status','type':'number'},
    ],
  },
];

// App component - represents the whole app
class App extends Component {
  // Default Page Type 0 = Courses, 1 == Students, 2 == Mentors/Admins
  constructor(props) {
    super(props);
    this.state = {
      pageType: 0,
    };
  }
  // Toggle pageType radio buttons
  togglePageType(toggleValue) {
    this.setState({
      pageType: toggleValue,
    });
  }

  renderCourses() {
    return this.props.courses.map((course) => (
      <Course key={course._id} course={course}/>
    ));
  }

  renderStudents() {
    return this.props.students.map((student) => (
      <User key={student._id} user_id={student._id} user_status={1} />
    ));
  }

  renderMentors() {
    return this.props.mentors.map((mentor) => (
      <User key={mentor._id} user_id={mentor._id} user_status={mentor.user_status} />
    ));
  }

  renderForm() {
    var currentForm = [InputForms[this.state.pageType]]
    return currentForm.map((form, index) => (
      <Form key={index} fields={form.fields} type={form.pageNum}/>
    ));
  }

  renderRadioButtons() {
    return(
      <header className="radio-buttons">
        <form className="radio-buttons">
          <table>
            <tbody>
              <tr>
                <td>
                  <input
                    type="radio"
                    readOnly
                    checked={this.state.pageType==0}
                    onClick={this.togglePageType.bind(this, 0)}
                  />
                  Courses
                </td>
                <td>
                  <input
                    type="radio"
                    readOnly
                    checked={this.state.pageType==1}
                    onClick={this.togglePageType.bind(this, 1)}
                  />
                  Students
                </td>
                <td>
                  <input
                    type="radio"
                    readOnly
                    checked={this.state.pageType==2}
                    onClick={this.togglePageType.bind(this, 2)}
                  />
                  Mentors
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </header>
    )
  }

  render() {
    const pageTitle = InputForms[this.state.pageType].pageType
    if (this.state.pageType == 0) {
      var renderContent = this.renderCourses()
    } else if (this.state.pageType == 1) {
      var renderContent = this.renderStudents()
    } else {
      var renderContent = this.renderMentors()
    }
    return (
      <div className="container">
        <div className="radio-buttons">
          {this.renderRadioButtons()}
        </div>
        <header>
          <h1>{pageTitle}</h1>
          {this.renderForm()}
        </header>
        <ul>
          {renderContent}
        </ul>
      </div>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe('lessons');
  Meteor.subscribe('users');
  Meteor.subscribe('courses');
  return {
    users: Users.find({}, { sort: { updated: -1} }).fetch(),
    students: Users.find({'user_status':1}, { sort: { updated: -1} }).fetch(),
    mentors: Users.find({'user_status':{$gt:1}}, { sort: { updated: -1} }).fetch(),
    courses: Courses.find({}, { sort: { to: -1 } }).fetch(),
    lessons: Lessons.find().fetch(),
  };
})(App);

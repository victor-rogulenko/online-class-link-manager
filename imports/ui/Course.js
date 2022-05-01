import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import User from './User.js';
import { Users } from '../api/users.js';
import Lesson from './Lesson.js';
import { Lessons } from '../api/lessons.js';
import toNum from '/lib/functions.js';

//import { Courses } from '../api/courses.js';

// Wrapper for displaying errors and successful results
const withErrorHandling = WrappedComponent => ({ showError, msgError, showSuccess, msgSuccess, children }) => {
  return (
    <WrappedComponent>
      {showError && <div className="error-message">{msgError}</div>}
      {showSuccess && <div className="success-message">{msgSuccess}</div>}
      {children}
    </WrappedComponent>
  );
};
const DivWithErrorHandling = withErrorHandling(({children}) => <div>{children}</div>)

//  Course component - represents a single course
export default class Course extends Component {
  constructor(props) {
      super(props);
      this.state = {
        showError: false,
        msgError: '',
        showSuccess: false,
        msgSuccess: '',
      };
  }

  deleteThisCourse() {
    console.log("deleting a course:", this.props.course._id)
    Meteor.call('courses.remove', this.props.course._id, function(error, result){
      if (error) {
        var msgError = error.error ;
        this.setState({
          showError: true,
          msgError: msgError,
        })
      }
      // if (result) {
      //   // This never runs because the course was deleted
      //   var msgSuccess = result;
      //   this.setState({
      //     showSuccess: true,
      //     msgSuccess: msgSuccess,
      //   })
      // }
    }.bind(this));
  }

  addNewLesson(event) {
    event.preventDefault();

    var args = {};

    args['title'] = ReactDOM.findDOMNode(this.refs.lessonTitle).value.trim();
    var from_dt = ReactDOM.findDOMNode(this.refs.from).value.trim();
    var to_dt = ReactDOM.findDOMNode(this.refs.to).value.trim();
    args['course'] = this.props.course._id;

    args['from'] = new Date(from_dt);
    args['to'] = new Date(to_dt);

    this.setState({
      showError: false,
      msgError: '',
      showSuccess: false,
      msgSuccess: '',
    });

    Meteor.call('lessons.insert', args);
    document.getElementById("addLesson").reset();
  }

  addNewUser(event) {
    event.preventDefault();

    const userEmail = ReactDOM.findDOMNode(this.refs.newUserEmail).value.trim();
    const userRole_str = ReactDOM.findDOMNode(this.refs.newUserRole).value.trim();
    const userRole = toNum(userRole_str)

    this.setState({
      showError: false,
      msgError: '',
      showSuccess: false,
      msgSuccess: '',
    });

    Meteor.call('courses.add_user', this.props.course._id, userEmail, userRole);
    document.getElementById("addUser").reset();
  }

  renderUsers() {
    if (typeof this.props.course.users !== 'undefined') {
      return this.props.course.users.sort(function(a, b){return b.user_status - a.user_status}).map((user, index) => (
        <User key={index} user_id={user.user_id} user_status={user.user_status} course_id={this.props.course._id._str}/>
      ));
    }
  }

  renderLessons() {
    if (typeof this.props.course.lessons !== 'undefined') {
      return this.props.course.lessons.map((lesson, index) => (
        <Lesson key={index} lesson_id={lesson.lesson_id} course_id={this.props.course._id._str}/>
      ));
    }
  }

  // Clear up messages on re-render
  componentWillReceiveProps(nextProps){
    if (this.refs.currentCourse) {
      this.setState({
        showError: false,
        msgError: '',
        showSuccess: false,
        msgSuccess: '',
      });
    }
  }

  render() {
    var fromts = this.props.course.from,
        from_date = (moment(fromts).isValid()) ? new moment(fromts).format('MMMM Do YYYY') : "..";
    var tots = this.props.course.to,
        to_date = (moment(tots).isValid()) ? new moment(tots).format('MMMM Do YYYY') : "..";

    var from_to_str = (moment(tots).isValid()) ? String("(" + from_date.toString() + " - " + to_date.toString()+ ")") : "";

    return (
      <li ref="currentCourse">
        <DivWithErrorHandling showError={this.state.showError} msgError={this.state.msgError} showSuccess={this.state.showSuccess} msgSuccess={this.state.msgSuccess}>
          <header className="title"><strong>{this.props.course.title}:</strong> group {this.props.course.group}   {from_to_str}
            <button className="delete" onClick={this.deleteThisCourse.bind(this)}>
              &times;
            </button>
          </header>
          <h2> Users : </h2>
          <ul className="small">
            {this.renderUsers()}
          </ul>
          <form className="small-form" id = "addUser" onSubmit={this.addNewUser.bind(this)} >
            <table>
              <tbody>
                <tr>
                  <td className='role'>
                    <select ref="newUserRole" defaultValue="1">
                      <option value="1">Student</option>
                      <option value="2">Admin</option>
                      <option value="3">Mentor</option>
                    </select>
                  </td>
                  <td className="email">
                    <input
                      type="email"
                      ref="newUserEmail"
                      placeholder="New user email"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <button type="submit">Add user</button>
          </form>
          <h2>Lessons : </h2>
          <ul className="small">
            {this.renderLessons()}
          </ul>
          <form className="small-form" id = "addLesson" onSubmit={this.addNewLesson.bind(this)} >
            <table>
              <tbody>
                <tr>
                  <td>
                    <input
                      type="text"
                      ref="lessonTitle"
                      placeholder="Lesson Title"
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <input
                      type="datetime-local"
                      ref="from"
                      placeholder="from"
                    />
                  </td>
                  <td>
                    <input
                      type="datetime-local"
                      ref="to"
                      placeholder="to"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <button type="submit">Add lesson</button>
          </form>
        </DivWithErrorHandling>
      </li>
    );
  }
}

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { withTracker } from 'meteor/react-meteor-data';

import { Courses } from '../api/courses.js';
import { Users } from '../api/users.js';
import Course from './Course.js';
import Form from './Form.js';

// App component - represents the whole app
class App extends Component {
  // Default Page Type 0 = Courses
  constructor(props) {
    super(props);

    this.state = {
      pageType: 0,
    };
  }
  // Respond to changing Page Type via radiobutton at the top of the page
  togglePageType(toggleValue) {
    this.setState({
      pageType: toggleValue,
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    // Find the text field via the React ref
    const courseName = ReactDOM.findDOMNode(this.refs.courseInput).value.trim();
    const courseGroup = ReactDOM.findDOMNode(this.refs.groupInput).value.trim();
    const courseFrom = ReactDOM.findDOMNode(this.refs.fromInput).value.trim();
    const courseTo = ReactDOM.findDOMNode(this.refs.toInput).value.trim();

    Meteor.call('courses.insert', courseName, courseGroup, courseFrom, courseTo);

    // Clear form
    ReactDOM.findDOMNode(this.refs.courseInput).value = '';
    ReactDOM.findDOMNode(this.refs.groupInput).value = '';
    ReactDOM.findDOMNode(this.refs.fromInput).value = '';
    ReactDOM.findDOMNode(this.refs.toInput).value = '';
  }

  renderCourses() {
    return this.props.courses.map((course) => (
      <Course key={course._id} course={course}/>
    ));
  }

  renderPageCourse() {
    return (
      <div className="container">
        <header>
          <h1>Course List</h1>
          <p>Add new course: </p>
          <form className="new-small" onSubmit={this.handleSubmit.bind(this)} >
            <table>
              <tbody>
                <tr>
                  <td>
                    <input
                      type="text"
                      ref="courseInput"
                      placeholder="Course title"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      ref="groupInput"
                      placeholder="Group #"
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    From
                    <input
                      type="date"
                      ref="fromInput"
                      placeholder="From"
                    />
                  </td>
                  <td>
                    To
                    <input
                      type="date"
                      ref="toInput"
                      placeholder="To"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <button type="submit">Add course</button>
          </form>
        </header>

        <ul>
          {this.renderCourses()}
        </ul>
      </div>
    );
  }

  render() {
    var renderPageByType;
    if (this.state.pageType == 0) {
      renderPageByType = this.renderPageCourse()
    } else {
      renderPageByType = ''
    }
    console.log ("this.state.pageType = ",this.state.pageType)

    return (
      <div className="container">
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
                      Classes
                    </td>
                    <td>
                      <input
                        type="radio"
                        readOnly
                        checked={this.state.pageType==2}
                        onClick={this.togglePageType.bind(this, 2)}
                      />
                      Users
                    </td>
                  </tr>
                </tbody>
              </table>
            </form>
          </header>
          {/* Render the body of the page */}
          {renderPageByType}
      </div>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe('users');
  Meteor.subscribe('courses');
  return {
    users: Users.find().fetch(),
    courses: Courses.find({}, { sort: { to: -1 } }).fetch(),
  };
})(App);

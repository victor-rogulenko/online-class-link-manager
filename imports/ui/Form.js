import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { withTracker } from 'meteor/react-meteor-data';
import InputField from './InputField.js';
import toNum from '/lib/functions.js';


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

// Form component - represents separate forms
export default class Form extends Component {
  constructor(props) {
      super(props);
      this.state = {
        showError: false,
        msgError: '',
        showSuccess: false,
        msgSuccess: '',
      };
  }

  handleSubmit(event) {
    event.preventDefault();

    // Find the text fields via the React ref. Clean up the form field
    var args = {};
    var arr = event.target;
    var arrLen = arr.length-1; // Subtract 1 to exclude submit button
    for (var i = 0; i < arrLen; i++) {
      if (arr[i].value.trim() != "") {
        args[arr[i].placeholder] = toNum(arr[i].value.trim());
      }
    }
    console.log(args)
    this.setState({
      showError: false,
      msgError: '',
      showSuccess: false,
      msgSuccess: '',
    });

    // Select appropriate Meteor method
    if (this.props.type == 0) {
      var meteorMethod = 'courses.insert';
    } else if (this.props.type == 1){
      args['user_status'] = 1;
      var meteorMethod = 'users.insert';
    } else {
      var meteorMethod = 'users.insert';
    }

    // Launch respective Meteor method dealing with DB on the server side
    Meteor.call(meteorMethod, args, function(error, result){
      if (error) {
        var msgError = error.error ;
        this.setState({
          showError: true,
          msgError: msgError,
        })
      }
      if (result) {
        var msgSuccess = result;
        this.setState({
          showSuccess: true,
          msgSuccess: msgSuccess,
        })
        document.getElementById("form").reset(); // Do not reset form if result is unsuccessful
      }
    }.bind(this));
  }

  renderInputFields() {
    return this.props.fields.map((field, index) => (
      <InputField key={index} title={field.ref} type={field.type} />
    ));
  }

  // Clear up messages on re-render
  componentWillReceiveProps(nextProps){
    if (nextProps.type != this.props.type) {
      this.setState({
        showError: false,
        msgError: '',
        showSuccess: false,
        msgSuccess: '',
      });
      document.getElementById("form").reset(); // Clean up the form if moved to another tab
    }
  }

  render() {
    return (
      <DivWithErrorHandling showError={this.state.showError} msgError={this.state.msgError} showSuccess={this.state.showSuccess} msgSuccess={this.state.msgSuccess}>
        <form id = "form" className="main-form" onSubmit={this.handleSubmit.bind(this)}>
          {this.renderInputFields()}
          <button type="submit">Add new</button>
        </form>
      </DivWithErrorHandling>
    );
  }
}

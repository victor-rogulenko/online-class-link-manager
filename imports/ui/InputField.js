import React, { Component } from 'react';
import ReactDOM from 'react-dom';

// InputField component - represents one input of an input form
export default class InputField extends Component {
  render() {
    return (
        <input
          type={this.props.type}
          ref={this.props.title}
          placeholder={this.props.title}
        />
    );
  }

}

import React from 'react';
import ReactDOM from 'react-dom';

import ExampleOne from './exampleOne';
import ExampleTwo from './exampleTwo';

function MainComponent(props){
  return <div>
    <h1>
      Immutable React Form
      <small>
        Form state management
      </small>
    </h1>
    <ul>
      <li>No involvement of rendering</li>
      <li>Opinionated form API</li>
      <li>Immutable form data</li>
      <li>HOC, not components</li>
    </ul>
    <ExampleOne />
    <ExampleTwo />
  </div>
}

ReactDOM.render(
  <MainComponent />,
  document.getElementById('root')
);
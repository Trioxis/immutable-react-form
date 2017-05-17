import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import s from './style.css';

import BasicFormExample from './examples/basicForm';
import BasicFormExampleCode from '!raw-loader!./examples/basicForm.js';

injectTapEventPlugin();

function Docs(props){
  return <MuiThemeProvider>
    <div>
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

      <ExampleHolster code={BasicFormExampleCode}>
        <h2>
          Shopping Cart for Hogwarts Example
        </h2>
        <p>
          Immutable React Form used at it's full potential! Features:
        </p>
        <ul>
          <li>Form model with nested fields</li>
          <li>And arrays!</li>
          <li>Custom text fields with Material UI</li>
          <li>Validation to confirm all fields are entered</li>
          <li>Async Validation on Username (to check against "server")</li>
          <li>Reset form fields</li>
          <li>Async submission</li>
        </ul>
        <BasicFormExample />
      </ExampleHolster>
    </div>
  </MuiThemeProvider>
}

ReactDOM.render(
  <Docs />,
  document.getElementById('root')
);

function ExampleHolster(props){
  return <div className={s.codeHoster}>
    <div className={s.codeHosterDocs}>
      {props.children}
    </div>
    <div className={s.codeHosterCode}>
      <pre>{props.code}</pre>
    </div>
  </div>
}

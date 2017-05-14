import React from 'react';
import ReactDOM from 'react-dom';

import s from './style.css';

import BasicFormExample from './examples/basicForm';
import BasicFormExampleCode from '!raw-loader!./examples/basicForm.js';
import ExampleTwo from './exampleTwo';
import ExampleThree from './exampleThree';
import ExampleValidation from './exampleValidation';
import ExampleValidationTwo from './exampleValidationTwo';

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

    <ExampleHolster code={BasicFormExampleCode}>
      <h2>
        Simple state management
      </h2>
      <BasicFormExample />
    </ExampleHolster>
    <ExampleTwo />
    <ExampleThree />
    <ExampleValidation />
    <ExampleValidationTwo />
  </div>
}

ReactDOM.render(
  <MainComponent />,
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

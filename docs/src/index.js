import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import s from './style.css';

import ExampleOne from './examples/one';
import ExampleOneIndexCode from '!raw-loader!./examples/one/index.js';
import ExampleOneFormCode from '!raw-loader!./examples/one/Form.js';
import ExampleOneTextFieldCode from '!raw-loader!./examples/one/TextField.js';
import ExampleOneValidationCode from '!raw-loader!./examples/one/validation.js';

import writeUpOverview from './writeUp/overview.md';
import writeUpExampleOverview from './writeUp/exampleOneOverview.md';
import writeUpExampleIndex from './writeUp/exampleOneIndex.md';
import writeUpExampleForm from './writeUp/exampleOneForm.md';
import writeUpExampleCustomFieldComponents from './writeUp/exampleCustomFieldComponents.md';
import writeUpValidation from './writeUp/validation.md';

injectTapEventPlugin();

function Docs(props){
  return <MuiThemeProvider>
    <div className={s.page}>
      <WriteUp className={s.topWriteUp} content={writeUpOverview}/>
      <SideBySide
        left={<WriteUp content={writeUpExampleOverview}/>}
        right={<ExampleOne />}
      />
      <SideBySide
        left={<WriteUp content={writeUpExampleIndex}/>}
        right={<pre>{ExampleOneIndexCode}</pre>}
        code
      />
      <SideBySide
        left={<WriteUp content={writeUpExampleForm}/>}
        right={<pre>{ExampleOneFormCode}</pre>}
        code
      />
      <SideBySide
        left={<WriteUp content={writeUpExampleCustomFieldComponents}/>}
        right={<pre>{ExampleOneTextFieldCode}</pre>}
        code
      />
      <SideBySide
        left={<WriteUp content={writeUpValidation}/>}
        right={<pre>{ExampleOneValidationCode}</pre>}
        code
      />
    </div>
  </MuiThemeProvider>
}

ReactDOM.render(
  <Docs />,
  document.getElementById('root')
);

function SideBySide(props){
  return <div className={s.sbsWrapper}>
    <div className={s.sbsColumn}>
      {props.left}
    </div>
    <div className={`${s.sbsColumn} ${!props.code || s.codeWrapper}`}>
      {props.right}
    </div>
  </div>
}

function Code(props){
  return <div className={s.codeWrapper}>
    <pre>{props.children}</pre>
  </div>
}

function WriteUp(props){
  return <div
    className={s.writeUp+' '+props.className}
    dangerouslySetInnerHTML={{__html:props.content}}
  />
}

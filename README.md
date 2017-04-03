# immutable-react-form

Immutable form state management for ReactJS

[![Dependency Status](https://david-dm.org/trioxis/immutable-react-form.svg)](https://david-dm.org/trioxis/immutable-react-form)
[![devDependency Status](https://david-dm.org/trioxis/immutable-react-form/dev-status.svg)](https://david-dm.org/trioxis/immutable-react-form#info=devDependencies)

```bash
npm i --save @trioxis/immutable-react-form
```

## Usage

Immutable form is a Higher Order Component (HOC), used like so:

```js
import React from 'react';
import { LocalStateForm } from '@trioxis/immutable-react-form';
import { Map } from 'immutable';

function MyForm(props){
  const {
    form
  } = props;
  return <form onSubmit={form.submission.submit}>
    <input
      type='text'
      value={form.model.get('name')}
      onChange={(e)=>update(form.model.set('name',e.target.value))}
    />
  </form>
}

LocalStateForm(
  // A function which takes props, and returns the form's model
  props => ({name: ''}),

  // The validation function. See Validation below for details
  //   This is a simple default
  () => new Map({}),

  // The submission function. Should return a promise
  (model, props) => Promise.resolve()
)(
  MyForm
)
```

Full props are as follows:

```js
const {
  form:{
    model, // Immutable JS
    update, // (model)=>void (expects entire model)
    meta:{
      dirty // bool (whether or not the model has changed)
    },
    validation:{
      get, // (keyPath)=>{valid:bool,message:string>}
      isValid, //bool
    },
    submission:{
      submit, // (event)=>void
      loading, // bool
      lastSubmission: {
        success, // bool
        error // error
      }
    }
  }
} = props;
```

### Validation

Validation function must return an (Immutable JS) Map where each key is a path to the validation object.

If a path is not defined, it is assumed valid.

Example:

```js
function validateForm(model){
  return new Map({
    ...(model.get('name').split(' ').length !== 2)
      && { name: { valid:false, message:'Apparently you should only have 2 names' } },
      ...!model.get('name')
      && { name: { valid:false, message:'Name is required' } },
    ...(model.get('experience').size < 3)
      && { experience : { valid:false, message:'Please write 3 or more things' } },
    ...(
      model.get('experience')
      .map((exp,i)=>new Map({item:exp,index:i}))
      .filter(exp=>!(['Education','Job'].includes(exp.getIn(['item','type']))))
      .reduce((acc,curr,i)=>({
        ...acc,
        [`experience.${curr.get('index')}.type`]: { valid:false, message:'Can be "Education" or "Job"'}
      }),{})
    )
  })
}
```

## Recipies

### Smart submit button

```js
(props)=>
  <input
    type='submit'
    value={props.form.submission.loading ? 'Submitting...' : 'Submit'}
    disabled={(
      !props.form.meta.dirty ||
      !props.form.validation.isValid ||
      props.form.submission.loading
    )}
  />
```

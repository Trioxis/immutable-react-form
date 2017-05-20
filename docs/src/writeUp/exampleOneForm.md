### Render a form

Rendering is intentionally unopinionated in Immutable React Form. `LocalStateForm` adds a property `form` to `props`. `props.form` is shaped like so:

```js
const {
  model, // Immutable JS Map
  update, // (model)=>void (expects entire model)
  meta:{
    dirty // bool (whether or not the model has changed)
  },
  validation:{
    get, // (keyPath)=>{status:"VALID"|"INVALID"|"PENDING",message:<string>}
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
} = props.form;
```

It's your job to render the form how you'd like.

#### Update the model

To update the model, simply call `form.update` and pass in the new model.

ImmutableJS is used to make it simple to update the form. 

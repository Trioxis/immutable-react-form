### LocalStateForm

`LocalStateForm` is a higher order component which provides all form functionality.

You must provide, in order:

- A function which receives `props` and returns the model (which is an `Object`)
- A validation operator (see validation below for details)
- An asynchronous function called when the form is submitted

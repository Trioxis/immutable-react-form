### Validation

Validation is designed to be very flexible. There is, however, a helper class to simplify validation and cover majority of use cases: `SimpleValidation`.

`SimpleValidation` is used in this example. Simply pass in a configuration object where each key aligns with a property in the model. And the value is a function which returns a promise.

If you need more control; `LocalStateForm` takes an observable operator.

```
(source:Observable)=>Observable
```

Where the returned `Observable` emits

```
{
  status:'VALID'|'INVALID'|'PENDING',
  message:string?
}
```

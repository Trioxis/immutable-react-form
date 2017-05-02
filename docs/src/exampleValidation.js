import React from 'react';
import { LocalStateForm } from 'immutable-react-form';
import { Map } from 'immutable';

import 'rxjs/add/operator/map';


let formData = {
  name:'',
  email:''
}


function Example(props){
  const {form} = props;
  return <div>
    <h2>
      Raw Validation Usage (Simple)
    </h2>
    <form onSubmit={form.submission.submit}>
      <p>
        <label>
          Name
        </label>
        <input
          type='text'
          value={form.model.get('name')}
          onChange={(e)=>
            form.update(form.model.set('name',e.target.value))
          }
        />
        <small>{form.validation.get('name').message}</small>
      </p>
      <p>
        <label>
          Email
        </label>
        <input
          type='text'
          value={form.model.get('email')}
          onChange={(e)=>
            form.update(form.model.set('email',e.target.value))
          }
        />
        <small>{form.validation.get('email').message}</small>
      </p>
      <input type='submit' />
    </form>
  </div>
}

const validationOperator = source=>
  source
  .map(validate=>{
    const { field, model } = validate;
    const fieldValue = model.get(field)
    if(validate.field === 'name'){
      return {
        field,
        status: fieldValue != '' ? 'VALID' : 'INVALID',
        message:'Name is required'
      };
    } else if(validate.field === 'email'){
      return {
        field,
        status: fieldValue.includes('@') ? 'VALID' : 'INVALID',
        message:'Email must contain "@"'
      };
    }
  })

export default LocalStateForm(
  props => (formData),
  validationOperator,
  (model, props) => {
    formData = model.toJS()
  }
)(Example);

import React from 'react';
import { LocalStateForm } from 'immutable-react-form';
import { Map } from 'immutable';

let formData = {
  name:'Derik Zoolander'
}


function ExampleTwo(props){
  const {form} = props;
  return <div>
    <h2>
      Form submission
    </h2>
    <form onSubmit={form.submission.submit}>
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
      <input type='submit' />
    </form>
    <p>
      Hello, my name is {formData.name}
    </p>
  </div>
}

export default LocalStateForm(
  props => (formData),
  null,
  (model, props) => {
    formData = model.toJS()
  }
)(ExampleTwo);

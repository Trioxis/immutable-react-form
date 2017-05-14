import React from 'react';
import { LocalStateForm } from 'immutable-react-form';
import { Map } from 'immutable';

const formData = {
  name:'Derik Zoolander'
}


function Example(props){
  const {form} = props;
  return <div>
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
    <p>
      Hello, my name is {form.model.get('name')}
    </p>
  </div>
}

export default LocalStateForm(
  props => (formData),
  null,
  (model, props) => console.log('Submitted!')
)(Example);

import React from 'react';
import { LocalStateForm } from 'immutable-react-form';
import { Map } from 'immutable';

const formData = {
  name:'Derik Zoolander'
}


function ExampleOne(props){
  const {form} = props;
  return <div>
    <h2>
      Simple state management
    </h2>
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
  () => new Map({}),
  (model, props) => console.log('Submitted!')
)(ExampleOne);

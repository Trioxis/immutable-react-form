import React from 'react';
import { LocalStateForm } from 'immutable-react-form';
import { Map } from 'immutable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

const animalTypes = ['Dog','Cat','Kangaroo'];

let formData = {
  myPets:[{
    name:'Red',
    type:'Kangaroo'
  }]
}

export function Example(props){
  const {form} = props;
  return <div>
    <h2>
      Complex form data
    </h2>
    <form onSubmit={form.submission.submit}>
      {
        form.model.get('myPets')
        .map((pet,i)=>
          <p key={i}>
            <span>#{i+1} - </span>
            <input
              type='text'
              value={pet.get('name')}
              onChange={(e)=>
                form.update(
                  form.model.setIn(
                    ['myPets',i,'name'],
                    e.target.value
                  )
                )
              }
            />
            <select
              type='text'
              value={pet.get('type')}
              onChange={(e)=>
                form.update(
                  form.model.setIn(
                    ['myPets',i,'type'],
                    e.target.value
                  )
                )
              }
            >
              {
                animalTypes.map(t=>
                  <option key={t}>
                    {t}
                  </option>
                )
              }
            </select>
          </p>
        )
      }
      <button
        onClick={
          (e)=>{
            e.preventDefault();
            form.update(
              form.model.updateIn(['myPets'],pets=>
                pets.push(new Map({type:'Cat',name:''}))
              )
            );
          }
        }
        >
          Another pet!
      </button>
    </form>
    {JSON.stringify(form.validation)}
  </div>
}

const validationOperator = source=>
  source
  .map(validate=>{
    const {field} = validate
    return {
      field,
      status:'INVALID',
      message:'watevs'
    }
  })

export default LocalStateForm(
  props => (formData),
  validationOperator,
  (model, props) => {
    formData = model.toJS()
  }
)(Example);

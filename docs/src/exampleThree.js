import React from 'react';
import { LocalStateForm } from 'immutable-react-form';
import { Map } from 'immutable';

let formData = {
  myPets:[{
    name:'Bowser',
    type:'Dog'
  }]
}

const animalTypes = ['Dog','Cat','Kangaroo'];

function ExampleThree(props){
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
  </div>
}

export default LocalStateForm(
  props => (formData),
  null,
  (model, props) => {
    formData = model.toJS()
  }
)(ExampleThree);

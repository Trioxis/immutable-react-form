import React from 'react';
import {injectForm} from '@trioxis/react-form';
import { fromJS } from 'immutable';

function Form(props){
  const {
    form:{
      model,
      setField,
      updateField,
      submit
    },
  } = props;

  return (
    <form onSubmit={submit}>
      {
        model.get('users').map((user,i)=>(
          <div>
            <input
              type='text'
              value={user.name}
              onChange={e=>setField(['users',i,'name'],e.target.value)}
            />
            <input
              type='text'
              value={user.email}
              onChange={e=>setField(['users',i,'email'],e.target.value)}
            />
          </div>
        ))
      }
      <button onClick={e=>
        updateField(
          ['users'],
          users=>users.push(fromJS(newUser()))
        )
      }>
        Add another user
      </button>
      <input type='submit' />
    </form>
  )
}

export default injectForm(
  props=>({
    users:[newUser(),newUser(),newUser()]
  }),
  (props,model)=>{
    console.log(props,model)
  }
)(Form);

function newUser(){
  return {
    name:'',
    email:''
  }
}
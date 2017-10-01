import React from 'react';
import {injectForm} from '@trioxis/react-form';

function Form(props){
  const {
    form:{
      model,
      updateField,
      submit
    },
  } = props;

  return (
    <form onSubmit={submit}>
      <label>Username</label>
      <input
        type='text'
        value={model.username}
        onChange={e=>updateField('username',e.target.value)}
      />
      <label>Password</label>
      <input
        type='text'
        value={model.password}
        onChange={e=>updateField('password',e.target.value)}
      />
      <input type='submit' />
    </form>
  )
}

export default injectForm(
  props=>({
    username:'',
    password:''
  }),
  (props,model)=>{
    console.log(props,model)
  }
)(Form);
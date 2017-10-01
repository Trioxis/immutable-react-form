import React from 'react';
import {injectForm} from '@trioxis/react-form';

function Form(props){
  const {
    form:{
      model,
      updateField
    },
  } = props;

  return [
    <label key='1'>Username</label>,
    <input
      key='2'
      type='text'
      value={model.username}
      onChange={e=>updateField('username',e.target.value)}
    />,
    <label key='3'>Password</label>,
    <input
      key='4'
      type='text'
      value={model.password}
      onChange={e=>updateField('password',e.target.value)}
    />
  ]
}

export default injectForm(
  props=>({
    username:'',
    password:''
  })
)(Form);
import React from 'react';
import { LocalStateForm } from 'immutable-react-form';
import { Map } from 'immutable';
import { Example } from './exampleThree';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';


let formData = {
  myPets:[{
    name:'Red',
    type:'Kangaroo'
  }]
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

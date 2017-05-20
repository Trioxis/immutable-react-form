// validation.js

import {
  SimpleValidation
} from 'immutable-react-form';

import {
  CheckUsernameIsAvailable
} from './data';

export default SimpleValidation({
  'user.shippingAddress':(valItem)=>{
    if(valItem.value.length < 10){
      return {
        status:'INVALID',
        message:'Too short'
      }
    }else{
      return {
        status:'VALID'
      }
    }
  },
  'user.username':CheckUsernameIsAvailable
});

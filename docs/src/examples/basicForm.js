import React from 'react';
import { LocalStateForm, SimpleValidation } from 'immutable-react-form';
import { Map } from 'immutable';

import MUITextField from 'material-ui/TextField';
import MUIPaper from 'material-ui/Paper';
import MUIFlatButton from 'material-ui/FlatButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import s from './basicForm.css';

let formData = {
  user:{
    name:'',
    shippingAddress:'',
    username:''
  },
  cart:[{
    quantity:5,
    item:'Bertie Botts Every Flavour Beans'
  }, {
    quantity:1,
    item:'Cauldron'
  }, {
    quantity:1,
    item:'Nimbus 2000'
  }, {
    quantity:3,
    item:'Robe'
  }]
}

function Example(props){
  const {
    form,
    form:{
      model
    }
  } = props;

  return <div>
    <MUIPaper className={s.formPaper}>
      <form onSubmit={form.submission.submit}>
        <TextField
          floatingLabelText="Name"
          fullWidth
          type='text'
          form={form}
          field='user.name'
        />
        <TextField
          floatingLabelText="Shipping Address"
          fullWidth
          type='text'
          form={form}
          field='user.shippingAddress'
        />
        <TextField
          floatingLabelText="Username (create new user)"
          fullWidth
          type='text'
          form={form}
          field='user.username'
        />
        <MUIPaper className={s.cart}>
          {model.get('cart').map((item,i)=>(
            <CartItem
              item={item}
              key={i}
              onChange={newItem=>form.update(
                model.setIn(['cart',i],newItem)
              )}
              onDelete={()=>form.update(
                model.deleteIn(['cart',i])
              )}
            />
          ))}
          <FloatingActionButton
            mini secondary
            className={s.cartAddButton}
            onClick={e => form.update(
              model.update(
                'cart',
                list=>list.push(NewCartItem())
              )
            )}
            >
            <ContentAdd />
          </FloatingActionButton>
        </MUIPaper>

        <MUIFlatButton
          primary
          onClick={form.submission.submit}>
          Continue to "Payment"
        </MUIFlatButton>
      </form>
    </MUIPaper>
    <MUIPaper className={s.formPaper}>
      <h3>Raw Data</h3>
      {JSON.stringify(model)}
      <h3>Validation Data</h3>
      {JSON.stringify(form.validation)}
    </MUIPaper>
  </div>
}

function validationConfig(){
  return{
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
  }
}

export default LocalStateForm(
  props => (formData),
  SimpleValidation(validationConfig()),
  (model, props) => {
    formData = model.toJS()
  }
)(Example);

function CartItem(props){
  const {
    onChange,
    onDelete,
    item
  } = props;
  return <div className={s.cartItem}>
    <input
      type='text'
      className={s.cartItemName}
      value={item.get('item')}
      onChange={e=>onChange(item.set('item',e.target.value))}
    />
    <input
      type="number" min="1" max="10" step='1'
      value={item.get('quantity')}
      onChange={e=>onChange(item.set('quantity',e.target.value))}
    />
    <button onClick={e => onDelete()}>
      X
    </button>
  </div>
}

function TextField(props){
  const {
    form,
    field,
    ...remainingProps
  } = props;

  const fieldValidationInfo = form.validation.get(field)

  return <MUITextField
    {...remainingProps}
    value={form.model.getIn(field.split('.'))}
    onChange={(e)=>
      form.update(form.model.setIn(field.split('.'),e.target.value))
    }
    errorText={
      (fieldValidationInfo.status !== 'VALID') ? fieldValidationInfo.message : null
    }
  />
}

function GetStockNames(){
  return [
    'Bertie Botts Every Flavour Beans',
    'Cauldron',
    'Nimbus 2000',
    'Robe',
    'Invisible Cloak'
  ];
}

function NewCartItem(){
  return new Map({item:'',quantity:1});
}

function CheckUsernameIsAvailable({value}){
  return new Promise((res,rej)=>{
    setTimeout(()=>{
      if(value.match(/^.*\d.*$/) !== null){
        res({
          status:'VALID'
        });
      }else{
        res({
          status:'INVALID',
          message:'Username should contain a number'
        })
      }

    }, 3000);
  })
}

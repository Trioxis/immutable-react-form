// Form.js
import React from 'react';

import MUIPaper from 'material-ui/Paper';
import MUIFlatButton from 'material-ui/FlatButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import TextField from './TextField';
import s from './styles.css';
import { NewCartItem } from './data';

export default function Form(props){
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
          onClick={form.submission.submit}
          disabled={(
            !form.meta.dirty ||
            !form.validation.isValid ||
            form.submission.loading
          )}
          >
          {
            form.submission.loading
              ? "Submitting..."
              : "Continue to \"Payment\""
          }
        </MUIFlatButton>
      </form>
    </MUIPaper>
    <MUIPaper className={s.formPaper+' '+s.formDataBox}>
      <h3>Form property</h3>
      <pre>{JSON.stringify(form,null,'  ')}</pre>
    </MUIPaper>
  </div>
}

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

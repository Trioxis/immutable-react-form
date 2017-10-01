import React from 'react';
import { fromJS } from 'immutable';
import {
  compose,
  withState,
  mapProps,
  withHandlers
} from 'recompose';

export const injectForm = (mapDataFromProps,onSubmit)=>compose(
  controlledForm(mapDataFromProps),
  submitableForm(onSubmit)
)

const controlledForm = (mapDataFromProps)=>compose(
  withState(
    '_model',
    '_modelUpdate',
    props=>fromJS(mapDataFromProps(props))
  ),
  mapProps(
    props=>({
      ...props,
      form:{
        ...props.form,
        model:props._model,
        updateField:(path,value)=>props._modelUpdate(props._model.setIn(path.split('.'),value)),
      }
    })
  )
)

const submitableForm = (onSubmit)=>compose(
  withHandlers({
    submit:props=>e=>{
      e.preventDefault()
      onSubmit(props,props.form.model.toJS())
    }
  }),
  mapProps(
    ({submit,...props})=>({
      ...props,
      form:{
        ...props.form,
        submit
      }
    })
  )
)
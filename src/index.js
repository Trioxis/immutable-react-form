import React from 'react';
import { fromJS } from 'immutable';
import {
  compose,
  withState,
  mapProps,
  withHandlers
} from 'recompose';

// Possible form states
// Valid, Validating, Invalid, Submitting, Clean,
// Submitted, SubmissionError

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
        setField:(path,value)=>props._modelUpdate(props._model.setIn(path,value)),
        updateField:(path,fn)=>{
          const updatedModel = props._model.updateIn(path,fn);
          return props._modelUpdate(updatedModel);
        },
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
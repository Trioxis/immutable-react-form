import React from 'react';
import { fromJS } from 'immutable';
import {
  compose,
  withState,
  mapProps,
  withHandlers,
  mapPropsStream
} from 'recompose';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { merge } from 'rxjs/observable/merge';
import { from } from 'rxjs/observable/from';

import { map } from 'rxjs/operator/map';
import { scan } from 'rxjs/operator/scan';
import { mergeMap } from 'rxjs/operator/mergeMap';
import { _do } from 'rxjs/operator/do';
import { _catch } from 'rxjs/operator/catch';

// Possible form states
// Valid, Validating, Invalid, Submitting, Clean,
// Submitted, SubmissionError

export const injectForm = (mapDataFromProps,onSubmit,validationConfig)=>compose(
  controlledForm(mapDataFromProps),
  validatedForm(validationConfig),
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
      if(e && e.preventDefault){
        e.preventDefault()
      }
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

const validatedForm = (validationConfig)=>compose(
  mapPropsStream(
    (props$)=>Observable::from(props$)
    ::mergeMap(props=>
      Observable::merge(
        Observable::of(null),
        Observable::of(props)
        ::mergeMap(({form})=>
          Object.entries(
            validationConfig(props)
          )
          .map(([key,val])=>({
            key,
            formValue:props.form.model.get(key),
            validationFn:val
          }))
        )
        ::mergeMap(async config => {
          const res = await config.validationFn(config.formValue);
          return{
            ...config,
            res:{
              valid:res === true,
              error:res !== true ? res.toString() : null
            }
          }
        })
        ::scan((acc,val)=>({
          ...acc,
          [val.key]:val.res
        }),{})
        ::_catch(console.error)
      )
      ::map(validation=>({
        ...props,
        form:{
          ...props.form,
          validation
        }
      }))
    )
  )
)
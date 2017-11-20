import React from 'react';
import { fromJS } from 'immutable';
import {
  compose,
  withState,
  mapProps,
  withHandlers,
  mapPropsStream,
  defaultProps,
  createEventHandler
} from 'recompose';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { of } from 'rxjs/observable/of';
import { merge } from 'rxjs/observable/merge';
import { from } from 'rxjs/observable/from';

import { map } from 'rxjs/operator/map';
import { scan } from 'rxjs/operator/scan';
import { take } from 'rxjs/operator/take';
import { filter } from 'rxjs/operator/filter';
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
  defaultProps({
    form:{
      fieldUpdated:createEventHandler()
    }
  }),
  withState(
    '_model',
    '_modelUpdate',
    props=>fromJS(mapDataFromProps(props))
  ),
  mapProps(
    ({_model,_modelUpdate,...props})=>({
      ...props,
      form:{
        ...props.form,
        model:_model,
        setField:(path,value)=>{
          _modelUpdate(_model.setIn(path,value))
          props.form.fieldUpdated.handler(path)          
        },
        updateField:(path,fn)=>{
          const updatedModel = _model.updateIn(path,fn);
          _modelUpdate(updatedModel);
          props.form.fieldUpdated.handler(path);
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

const VALIDATION_STATUS = {
  VALID:'VALID',
  INVALID:'INVALID',
  LOADING:'LOADING'
}

const validatedForm = (validationConfig)=>compose(
  mapPropsStream(
    (props$)=>{
      const _validationConfig = validationConfig || {};

      return Observable::merge(
        Observable::from(props$),
        Observable::from(props$)
        ::take(1)  
        ::mergeMap(props=>{
          const fieldUpdate$ = Observable::from(props.form.fieldUpdated.stream);
          return fieldUpdate$

          // Debt this will break nested fields
          ::map(field=>field[0])


          ::map(fieldUpdated=>({
            fieldUpdated,
            validationFn:_validationConfig[fieldUpdated],
            props,
          }))
        })
        ::filter(info=>info.validationFn !== null && info.validationFn !== undefined)
        // ::mergeMap(async info=>({
        //   ...info,
        //   res:await info.validationFn(info.props.form.model.getIn(info.props.fieldUpdated))
        // }))
        ::map(info=>({
          ...info,
          res:info.validationFn(info.props.form.model.get(info.props.fieldUpdated))
        }))
        // ::_do(console.log)
        ::scan((acc,{props,res,fieldUpdated})=>({
          ...props,
          form:{
            ...props.form,
            validation:{
              ...acc.form.validation,
              [fieldUpdated]:res
            }
          }
        }),{form:{validation:{}}})
        ::_do(console.log)
      )
    }
  )
)
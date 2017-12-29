import React, { Component } from 'react';
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
import { empty } from 'rxjs/observable/empty';
import { merge } from 'rxjs/observable/merge';
import { from } from 'rxjs/observable/from';

import { map } from 'rxjs/operator/map';
import { scan } from 'rxjs/operator/scan';
import { take } from 'rxjs/operator/take';
import { letProto } from 'rxjs/operator/let';
import { filter } from 'rxjs/operator/filter';
import { mergeMap } from 'rxjs/operator/mergeMap';
import { _do } from 'rxjs/operator/do';
import { _catch } from 'rxjs/operator/catch';
import { debounceTime } from 'rxjs/operator/debounceTime';
import { takeWhile } from 'rxjs/operator/takeWhile';
import { share } from 'rxjs/operator/share';
import { toPromise } from 'rxjs/operator/toPromise';

// Possible form states
// Valid, Validating, Invalid, Submitting, Clean,
// Submitted, SubmissionError


const FORM_STATE = {
  CLEAN:'CLEAN',
  DIRTY:'DIRTY',
  VALID:'VALID',
  INVALID:'INVALID',
  SUBMITTING:'SUBMITTING',
  SUBMITTED:'SUBMITTED',
  SUBMISSION_ERROR:'SUBMISSION_ERROR',
}

type ValidationConfig = {
  [key:Array]:()=>Promise<null>
}

export const injectForm =
(mapDataFromProps,onSubmit,validationConfig:ValidationConfig)=>
(InnerComponent)=>{

  const _validationConfig = validationConfig || {};
  
  return class ImmutableForm extends Component{
    constructor(props){
      super(props);

      const blankValidation = Object.keys(_validationConfig)
      .reduce((acc,curr)=>({
        ...acc,
        [curr]:null
      }),{});

      this.state = {
        model: fromJS(mapDataFromProps(this.props)),
        validation: blankValidation,
        state:FORM_STATE.CLEAN
      }
      this.submitWhenValid = false;
      this.updateField$ = new Subject();
      this.setField$ = new Subject();
      const updateState$ = new Subject();
      const validateField$ = new Subject();
      this.submit$ = new Subject();
      this.submitted$ = new Subject();
      const setFormState$ = new Subject();

      updateState$.subscribe((obj) => this.setState(obj));
      
      setFormState$.subscribe((state)=>updateState$.next({state}));

      Observable
      ::merge(
        this.setField$
        ::map(([pointer,value])=>[
          pointer,
          this.state.model.setIn(pointer,value)
        ]),

        this.updateField$
        ::map(([pointer,updater])=>[
          pointer,
          this.state.model.updateIn(pointer,updater)
        ]),
      )
      // Fire validation
      ::_do((args)=>validateField$.next(args))
      // Update Model
      ::map(([pointer,model])=>({model}))
      .subscribe(updateState$)

      const fieldValidated$ = Observable
      ::merge(
        validateField$
        ::filter(([pointer,model])=>(_validationConfig[pointer] != null))
        ::map(([pointer,model])=>([pointer,null])),

        validateField$
        ::filter(([pointer,model])=>(_validationConfig[pointer] != null))
        ::mergeMap(async ([pointer,model])=>{
          const validationFn = _validationConfig[pointer];
  
          if(validationFn != null){
            try{
              await validationFn(model);
              return [pointer,true];
            }catch(e){
              return [pointer,e];
            }
          }
        })
      )
      ::scan((acc,[key,val])=>({
        ...acc,
        [key]:val
      }),blankValidation)
      ::share()

      fieldValidated$
      ::map(validation=>({validation}))
      .subscribe(updateState$)

      // Watch for fully valid form, and then submit if we're waiting for it
      fieldValidated$
      ::filter(()=>this.submitWhenValid === true)
      ::map(()=>{
        const values:Array<bool|Error> = Object.values(this.state.validation);

        if(values.every(val=>val === true)){
          return [this.props,this.state.model];
        } else if (values.some(val=>val instanceof Error)){
          throw new Error('Form has validation errors')
        } else {
          return null
        }
      })
      ::filter(valid=>valid !== null)
      .subscribe(this.submit$)

      this.submit$
      ::filter(()=>
        Object.values(this.state.validation)
        .every(val=>val === true)
      )
      ::map(([props,model])=>[
        props,
        model.toJS()
      ])
      ::mergeMap(async args=>(await onSubmit(...args)))
      .subscribe(this.submitted$)

      this.submit$
      ::mergeMap((model)=>
        Object.entries(this.state.validation)
        .map(([key,val])=>([key,val,model]))
      )
      ::filter(([key,val])=>val === null)
      ::_do(()=>(this.submitWhenValid = true))
      ::map(([key,val,model])=>([key,model]))
      .subscribe(validateField$)
      
    }

    validField(pointer){
      const res = this.state.validation[pointer]
      if(res !== undefined){
        return res;
      }else{
        return true;
      }
    }

    async submitForm(){
      const promise = this.submitted$
      ::take(1)
      ::toPromise();

      this.submit$.next([this.props,this.state.model]);

      return await promise;
    }

    render(){
      const {
        ...remainingProps
      } = this.props;

      const { model } = this.state;

      return <InnerComponent
        {...remainingProps}
        form={{
          model,
          setField:(...args)=>this.setField$.next(args),
          updateField:(...args)=>this.updateField$.next(args),
          validField:this.validField.bind(this),
          submit:this.submitForm.bind(this)
        }}
        />
    }
  }  
}
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


const FORM_STATE = {
  CLEAN:'CLEAN',
  VALID:'VALID',
  VALIDATING:'VALIDATING',
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
  return class ImmutableForm extends Component{
    constructor(props){
      super(props);
      this.state = {
        model: fromJS(mapDataFromProps(this.props)),
        validation: {}
      }
      this.updateField$ = new Subject();
      this.setField$ = new Subject();
      this.updateState$ = new Subject();
      this.validateField$ = new Subject();
      this.submit$ = new Subject();

      this.updateState$.subscribe((obj) => this.setState(obj));

      this.fieldUpdated$ = Observable
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
      ::_do((args)=>this.validateField$.next(args))
      // Update Model
      ::map(([pointer,model])=>model)
      .subscribe((model)=>this.updateState$.next({model}))

      this.validateField$
      ::mergeMap(async ([pointer,model])=>{
        const validationFn = validationConfig[pointer];

        if(validationFn != null){
          try{
            await validationFn(model);
            return [pointer,true];
          }catch(e){
            return [pointer,e]
          }
        }
      })
      ::scan((acc,[key,val])=>({
        ...acc,
        [key]:val
      }))
      .subscribe((validation=>this.updateState$.next({validation})))

      this.submit$
      ::map(([props,model])=>[
        props,
        model.toJS()
      ])
      .subscribe(args=>onSubmit(...args))
    }

    validField(pointer){
      console.log(this.state)
      const res = this.state.validation[pointer]
      if(res !== undefined){
        return res;
      }else{
        return true;
      }
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
          submit:()=>this.submit$.next([remainingProps,model])
        }}
        />
    }
  }  
}
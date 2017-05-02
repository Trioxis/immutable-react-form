import React from 'react';
import curry from 'lodash/curry';
import { fromJS, is, List, Map } from 'immutable';

import { Subject } from 'rxjs/Subject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';


const setupForm = curry((updateModel,data,original,validationData)=>{
  return {
    // Core API
    update:updateModel,
    model:data,
    meta:{
      dirty:!is(data,original)
    },
    validation:{
      get:(key)=>validationData.get(key,{
        status:'VALID',
        message:''
      }),
      isValid:validationData.size === 0,
      toJSON:()=>validationData.toJSON()
    },

    // For easy debugging
    toJSON:()=>data.toJSON(),

    // Helpers
    set:(key,val)=>updateModel(data.set(key,val)),
    setIn:(key,val)=>updateModel(data.setIn(key,val)),
  }
});

type ValidationResult = {
  field:string, // pointer to field
  status:'VALID' | 'INVALID',
  message?:string // Required when INVALID
}

export const LocalStateForm = curry((getForm,validationOperator,submitFn,InputComponent)=>{
  return class extends React.Component{
    constructor(props){
      super(props);

      this.formUpdateObservable = new Subject();

      this.state = {
        model:fromJS(getForm(props)),
        submitting:false,
        lastSubmissionSuccessful:null,
        validationData:new Map()
      }
      if(validationOperator){
        this.formUpdateObservable
        .mergeMap(model=>Observable
          .from(Array.from(model.keys()))
          .do(console.log)
          .map(field=>({
            model,
            field
          }))
        )
        .let(validationOperator)
        .do(console.log)
        .scan((acc,res:ValidationResult)=>
          acc.set(
            res.field,
            {
              message:res.status != 'VALID' ? res.message : null,
              status:res.status
            }
          )
        ,new Map())
        .do(r=>console.log(r.toJSON()))
        .subscribe(validationData => this.setState({validationData}))
      }
      this.formUpdateObservable.subscribe(model=>this.setState({model}))
    }

    updateForm(model){
      this.formUpdateObservable.next(model)
    }

    async submit(e){
      e.preventDefault();
      this.setState({submitting:true});
      try{
        await submitFn(this.state.model, this.props);
        this.setState({
          submitting:false,
          lastSubmission:{
            success:true
          }
        });
      }catch(e){
        this.setState({
          submitting:false,
          lastSubmission:{
            success:false,
            error:e
          }
        });
      }
    }

    render(){
      const form = Object.assign(
        {},
        setupForm(
          this.updateForm.bind(this),
          this.state.model,
          fromJS(getForm(this.props)),
          this.state.validationData,
          submitFn
        ),
        {
          submission:{
            submit:this.submit.bind(this),
            loading:this.state.submitting,
            lastSubmission:this.state.lastSubmission
          }
        }
      );

      return <InputComponent
        {...this.props}
        form={form}
      />
    }
  }
})

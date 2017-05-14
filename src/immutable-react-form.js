import React from 'react';
import curry from 'lodash/curry';
import { fromJS, is, List, Map, isCollection } from 'immutable';

import { Subject } from 'rxjs/Subject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/pairwise';


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
      this.validateFieldObservable = new Subject();

      this.state = {
        model:fromJS(getForm(props)),
        submitting:false,
        lastSubmissionSuccessful:null,
        validationData:new Map()
      }
      if(validationOperator){
        this.validateFieldObservable
        .let(validationOperator)
        .scan((acc,res:ValidationResult)=>
          acc.set(
            res.field,
            {
              message:res.status != 'VALID' ? res.message : null,
              status:res.status
            }
          )
        ,new Map())
        .subscribe(validationData => this.setState({validationData}))

        this.formUpdateObservable
        .pairwise()
        .mergeMap(([prevModel,nextModel])=>Observable
          .from(diffModels(prevModel,nextModel))
          .map(field=>({
            model:nextModel,
            field
          }))
        )
        .subscribe(this.validateFieldObservable)

      }
      this.formUpdateObservable.subscribe(model=>this.setState({model}))
    }

    updateForm(model){
      this.formUpdateObservable.next(model)
    }

    async submit(e){
      e.preventDefault();
      // First, force validation on all keys
      Observable.from(deepRetrieveKeys(this.state.model))
      .map(field=>({
        model:this.state.model,
        field
      }))
      .subscribe(this.validateFieldObservable);

      // If valid, update state to indicate form is submitting
      this.setState({submitting:true});

      // Perform submission
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

function diffModels(prevModel,nextModel,currentPath){
  const calcPath = (key)=>(currentPath ? currentPath+'.'+key : key)

  const diffedRoot = nextModel.filter((val,key)=>{
    return !is(prevModel.get(key),val);
  });


  return diffedRoot
  .filter((val,key)=>isCollection(val))
  .map((val,key)=>{
    return diffModels(prevModel.get(key),nextModel.get(key),calcPath(key));
  })
  .reduce((a,b)=>a.concat(b),[])
  .concat(
    Array.from(diffedRoot.keys())
    .map(calcPath)
  );
}

function deepRetrieveKeys(collection,parentName):Array<string>{
  const thisColKeys = Array.from(collection.keys())
  .map(k=>parentName ? parentName+'.'+k : k);

  return Array.from(collection.entries())
  .filter(([key,val])=>isCollection(val))
  .map(([key,val])=>deepRetrieveKeys(val,parentName ? parentName+'.'+key : key))
  .reduce((a,b)=>a.concat(b),[])
  .concat(thisColKeys);
}

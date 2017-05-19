import React from 'react';
import curry from 'lodash/curry';
import { fromJS, is, List, Map, isCollection } from 'immutable';

import { Subject } from 'rxjs/Subject'
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/catch';


// Validation only
import 'rxjs/add/operator/groupBy';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';

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
        .catch(console.error)
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
      const {validationData} = this.state;

      const allFields = deepRetrieveKeys(this.state.model);
      const validatedFields = validationData.keySeq().toJS();
      const unvalidatedFields = allFields.filter(field=>!validatedFields.includes(field));
      const invalidFields = validationData.filter(item=>item.status === 'INVALID');

      console.log(unvalidatedFields.length +' '+ invalidFields.size)
      // All fields are validated and valid
      if(unvalidatedFields.length === 0 && invalidFields.size === 0){
        // Mark as submitting
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
      }else{
        // Validate all unvalidated fields
        Observable.from(unvalidatedFields)
        .map(field=>({
          model:this.state.model,
          field
        }))
        .subscribe(this.validateFieldObservable);
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


export function SimpleValidation(config){
  return (source)=>source
  .groupBy(valItem=>valItem.field)
  .mergeMap(obs=>{
    const configItem = config[obs.key];
    if(configItem){
      return obs
      .debounceTime(500)
      .switchMap(async valItem=>{
        const value = valItem.model.getIn(valItem.field.split('.'))
        const res = await configItem({
          value
        });
        console.log(res)
        return {
          ...res,
          field:valItem.field
        }
      })
    }else{
      return obs.map(valItem=>({
        status:'VALID',
        field:valItem.field
      }))
    }
  })
}

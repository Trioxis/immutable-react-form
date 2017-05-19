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
import 'rxjs/add/operator/publish';


// Validation only
import 'rxjs/add/operator/groupBy';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/delay';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/merge';

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
      isValid:validationData.every(item=>item.status === 'VALID'),
      data:validationData
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
        this.validatedFields = this.validateFieldObservable
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
        .publish()

        this.validatedFields
        .subscribe(validationData => this.setState({validationData}))

        this.validatedFields.connect();

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
      if(e){
        e.preventDefault();
      }
      const {validationData} = this.state;

      const allFields = deepRetrieveKeys(this.state.model);
      const validatedFields = validationData.keySeq().toJS();
      const unvalidatedFields = allFields.filter(field=>!validatedFields.includes(field));
      const invalidFields = validationData.filter(item=>item.status === 'INVALID');

      console.log(unvalidatedFields.length +' '+ invalidFields.size)

      if(invalidFields.size > 0){
        console.warn('Form submission attempted with invalid fields')
        this.setState({
          submitting:false,
          lastSubmission:{
            success:false,
            error:new Error('Some fields are invalid')
          }
        });
        return;
      } else if(unvalidatedFields.length === 0){
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
        // We're about to validate all unvalidated fields
        // So everything becomes valid, then we should submit
        this.validatedFields
        .debounceTime(10)
        .takeWhile(newValidationData=>!newValidationData.some(item=>item.status === 'INVALID'))
        .filter(newValidationData =>{
          const newValidatedFields = newValidationData
            .filter(item=>item.status === 'VALID')
            .keySeq().toJS();
          const stillUnvalidatedFields = allFields.filter(field=>!newValidatedFields.includes(field))
          return stillUnvalidatedFields.length === 0;
        })
        .take(1)
        // Delay for React to SetState properly
        .delay(20)
        .do(()=>console.log('Resubmitting...'))
        .subscribe(()=>this.submit())

        console.log('Form validating...')

        // Validate all unvalidated fields
        Observable.from(unvalidatedFields)
        .map(field=>({
          model:this.state.model,
          field
        }))
        .subscribe(d=>this.validateFieldObservable.next(d));
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
      return Observable.merge(
        obs.map(valItem=>({
          status:'PENDING',
          field:valItem.field
        })),
        obs
        .debounceTime(500)
        .switchMap(async valItem=>{
          const value = valItem.model.getIn(valItem.field.split('.'))
          const res = await configItem({
            value
          });

          return {
            ...res,
            field:valItem.field
          }
        })
      );
    }else{
      return obs.map(valItem=>({
        status:'VALID',
        field:valItem.field
      }))
    }
  })
}

import React from 'react';
import curry from 'lodash/curry';
import { fromJS, is, List, Map } from 'immutable';

const setupForm = curry((updateModel,data,original,validate)=>{
  const validationData = validate(data) || new Map();
  return {
    // Core API
    update:updateModel,
    model:data,
    meta:{
      dirty:!is(data,original)
    },
    validation:{
      get:(key)=>validationData.get(key,{
        valid:true,
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

export const LocalStateForm = curry((getForm,validate,submitFn,InputComponent)=>{
  return class extends React.Component{
    constructor(props){
      super(props);
      this.state = {
        model:fromJS(getForm(props)),
        submitting:false,
        lastSubmissionSuccessful:null
      }
    }

    updateForm(model){
      this.setState({model})
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
          validate,
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

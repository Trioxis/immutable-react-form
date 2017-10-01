import React from 'react';
import { fromJS } from 'immutable';
import { compose, withState, mapProps } from 'recompose';

export const injectForm = (getDataFromProps)=>compose(
  withState(
    '_model',
    '_modelUpdate',
    props=>fromJS(getDataFromProps(props))
  ),
  mapProps(
    props=>({
      form:{
        model:props._model,
        updateField:(path,value)=>props._modelUpdate(props._model.setIn(path.split('.'),value))
      },
      ...props
    })
  )
)
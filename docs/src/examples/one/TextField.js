// TextField.js
import React from 'react';
import MUITextField from 'material-ui/TextField';

export default function TextField(props){
  const {
    form,
    field,
    ...remainingProps
  } = props;

  const fieldValidationInfo = form.validation.get(field)

  return <MUITextField
    {...remainingProps}
    value={form.model.getIn(field.split('.'))}
    onChange={(e)=>
      form.update(form.model.setIn(field.split('.'),e.target.value))
    }
    errorText={({
      INVALID:fieldValidationInfo.message,
      PENDING:'...'
    })[fieldValidationInfo.status]
    }
  />
}

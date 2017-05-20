// index.js
import {
  LocalStateForm,
  SimpleValidation
} from 'immutable-react-form';

import Form from './form';
import validation from './validation';
import {GetData,UpdateData} from './data';

export default LocalStateForm(
  props => (GetData()),
  validation,
  submit
)(Form);

async function submit(model,props){
  await UpdateData(model);
}

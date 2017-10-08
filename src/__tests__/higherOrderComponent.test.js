import React from 'react';
import { mount } from 'enzyme';
import {injectForm} from '../';


test('Enhanced component should render',()=>{
  const formElements = <div>Special Form</div>;

  const MyForm = ()=>formElements

  const EnhancedForm = injectForm(
    props=>({}),
    props=>null,
    props=>({})
  )(MyForm)

  const tree = mount(<EnhancedForm />);

  expect(tree.contains(formElements)).toBe(true)
  expect(tree).toMatchSnapshot()
})

test('Form data may be calculated from props',()=>{
  const MyForm = jest.fn(
    (props)=>null
  );

  const EnhancedForm = injectForm(
    props=>props.data,
    props=>null,
    props=>({})
  )(MyForm)

  const tree = mount(<EnhancedForm data={{foo:'bar'}} />);

  expect(MyForm).toHaveBeenCalledTimes(1);
  const firstRender = MyForm.mock.calls[0][0];
  expect(firstRender.form.model.get('foo')).toBe('bar');
})

test('SetField updates model',()=>{
  const MyForm = jest.fn(()=>null);

  const EnhancedForm = injectForm(
    props=>({aField:'Foo'}),
    props=>null,
    props=>({})
  )(MyForm)

  const tree = mount(<EnhancedForm />);
  
  expect(MyForm).toHaveBeenCalledTimes(1);
  const firstRender = MyForm.mock.calls[0][0];
  expect(firstRender.form.model.get('aField')).toBe('Foo');

  firstRender.form.setField(['aField'],'Bar');

  expect(MyForm).toHaveBeenCalledTimes(2);
  const secondRender = MyForm.mock.calls[1][0];
  expect(secondRender.form.model.get('aField')).toBe('Bar');
})
import React from 'react';
import { mount } from 'enzyme';
import {injectForm} from '../';


test('Enhanced component should render with form props',()=>{
  const formElements = <div>Special Form</div>;

  const MyForm = jest.fn(()=>formElements)

  const EnhancedForm = injectForm(
    props=>({}),
    props=>null,
    props=>({})
  )(MyForm)

  const tree = mount(<EnhancedForm />);

  expect(tree.contains(formElements)).toBe(true)
  expect(tree).toMatchSnapshot()

  // Detect high level API changes
  expect(MyForm.mock.calls.length).toBe(1)
  expect(MyForm.mock.calls[0][0]).toMatchSnapshot()
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

test('UpdateField updates model',()=>{
  const MyForm = jest.fn(()=>null);

  const EnhancedForm = injectForm(
    props=>({aField:['Foo']}),
    props=>null,
    props=>({})
  )(MyForm)

  const tree = mount(<EnhancedForm />);
  
  expect(MyForm).toHaveBeenCalledTimes(1);
  const firstRender = MyForm.mock.calls[0][0];
  expect(firstRender.form.model.get('aField').toJS()).toEqual(['Foo']);

  firstRender.form.updateField(['aField'],list=>list.push('Bar'));

  expect(MyForm).toHaveBeenCalledTimes(2);
  const secondRender = MyForm.mock.calls[1][0];
  expect(secondRender.form.model.get('aField').toJS()).toEqual(['Foo','Bar']);
})

test('Submit function receives appropriate args',()=>{
  const MyForm = jest.fn(()=>null);
  const submitFn = jest.fn()

  const EnhancedForm = injectForm(
    props=>({aField:'foo'}),
    submitFn,
    props=>({})
  )(MyForm)

  const tree = mount(<EnhancedForm aProp='bar' />);
  
  const firstRender = MyForm.mock.calls[0][0];
  firstRender.form.setField(['aField'],'baz');
  const secondRender = MyForm.mock.calls[1][0];

  expect(submitFn.mock.calls.length).toBe(0)
  secondRender.form.submit();
  expect(submitFn.mock.calls.length).toBe(1)
  
  // Check both props and model exist
  expect(submitFn.mock.calls[0].length).toBe(2)

  // Props checks
  expect(submitFn.mock.calls[0][0].aProp).toBe('bar')

  // Model checks
  expect(submitFn.mock.calls[0][1]).toEqual({"aField":"baz"})

  expect(submitFn.mock.calls[0]).toMatchSnapshot()
})
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
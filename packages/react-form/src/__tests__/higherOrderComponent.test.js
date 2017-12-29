import React from "react";
import { mount } from "enzyme";
import { injectForm } from "../";

test("Enhanced component should render with form props", () => {
  const formElements = <div>Special Form</div>;

  const MyForm = jest.fn(() => formElements);

  const EnhancedForm = injectForm(props => ({}), props => null, null)(MyForm);

  const tree = mount(<EnhancedForm foo="bar" />);

  expect(tree.contains(formElements)).toBe(true);

  // Detect high level API changes
  expect(MyForm).toHaveBeenCalledTimes(1);
  expect(CompnentsLatestCall(MyForm)).toMatchSnapshot();
});

test("Form data may be calculated from props", () => {
  const MyForm = jest.fn(props => null);

  const EnhancedForm = injectForm(props => props.data, props => null, null)(
    MyForm
  );

  const tree = mount(<EnhancedForm data={{ foo: "bar" }} />);

  expect(MyForm).toHaveBeenCalledTimes(1);
  const firstRender = CompnentsLatestCall(MyForm);
  expect(firstRender.form.model.get("foo")).toBe("bar");
});

test("SetField updates model", () => {
  const MyForm = jest.fn(() => null);

  const EnhancedForm = injectForm(
    props => ({ aField: "Foo" }),
    props => null,
    null
  )(MyForm);

  const tree = mount(<EnhancedForm />);

  expect(MyForm).toHaveBeenCalledTimes(1);
  const firstRender = CompnentsLatestCall(MyForm);
  expect(firstRender.form.model.get("aField")).toBe("Foo");

  firstRender.form.setField(["aField"], "Bar");

  expect(MyForm).toHaveBeenCalledTimes(2);
  const secondRender = CompnentsLatestCall(MyForm);
  expect(secondRender.form.model.get("aField")).toBe("Bar");
});

test("UpdateField updates model", () => {
  const MyForm = jest.fn(() => null);

  const EnhancedForm = injectForm(
    props => ({ aField: ["Foo"] }),
    props => null,
    null
  )(MyForm);

  const tree = mount(<EnhancedForm />);

  expect(MyForm).toHaveBeenCalledTimes(1);
  const firstRender = CompnentsLatestCall(MyForm);
  expect(firstRender.form.model.get("aField").toJS()).toEqual(["Foo"]);

  firstRender.form.updateField(["aField"], list => list.push("Bar"));

  expect(MyForm).toHaveBeenCalledTimes(2);
  const secondRender = CompnentsLatestCall(MyForm);
  expect(secondRender.form.model.get("aField").toJS()).toEqual(["Foo", "Bar"]);
});

test("Submit function receives appropriate args", async () => {
  const MyForm = jest.fn(() => null);
  const submitFn = jest.fn();

  const EnhancedForm = injectForm(props => ({ aField: "foo" }), submitFn, null)(
    MyForm
  );

  const tree = mount(<EnhancedForm aProp="bar" />);

  const firstRender = CompnentsLatestCall(MyForm);
  firstRender.form.setField(["aField"], "baz");
  const secondRender = CompnentsLatestCall(MyForm);

  expect(submitFn).toHaveBeenCalledTimes(0);
  await secondRender.form.submit();
  expect(submitFn).toHaveBeenCalledTimes(1);

  // Check both props and model exist
  expect(submitFn.mock.calls[0].length).toBe(2);

  // Props checks
  expect(submitFn.mock.calls[0][0].aProp).toBe("bar");

  // Model checks
  expect(submitFn.mock.calls[0][1]).toEqual({ aField: "baz" });

  expect(submitFn.mock.calls[0]).toMatchSnapshot();
});

test("Validation fires fields for with config as they're edited", () => {
  const MyForm = jest.fn(() => null);
  const aFieldValidator = jest.fn(() => true);
  const bFieldValidator = jest.fn(() => true);
  const submitFn = jest.fn(() => null);

  const EnhancedForm = injectForm(
    props => ({ aField: "foo", bField: "" }),
    submitFn,
    {
      aField: aFieldValidator,
      bField: bFieldValidator
    }
  )(MyForm);

  const tree = mount(<EnhancedForm />);

  expect(aFieldValidator).toHaveBeenCalledTimes(0);
  expect(bFieldValidator).toHaveBeenCalledTimes(0);

  const firstRender = CompnentsLatestCall(MyForm);
  firstRender.form.setField(["aField"], "baz");

  expect(aFieldValidator).toHaveBeenCalledTimes(1);
  expect(bFieldValidator).toHaveBeenCalledTimes(0);
});

test("Validation information is available to enhanced component", () => {
  const MyForm = jest.fn(() => null);
  const submitFn = jest.fn(() => null);

  const EnhancedForm = injectForm(props => ({ aField: "foo" }), submitFn, {
    aField: () => Promise.reject(new Error("Oops"))
  })(MyForm);

  const tree = mount(<EnhancedForm />);

  const firstRender = CompnentsLatestCall(MyForm);
  firstRender.form.setField(["aField"], "baz");

  const secondRender = CompnentsLatestCall(MyForm);

  const fieldRes = secondRender.form.validField(["afield"]);
  expect(fieldRes).toBe(true);
});

test("Validation prevents submission on failure", async () => {
  const MyForm = jest.fn(() => null);
  const aFieldValidator = jest.fn(() => Promise.reject(new Error("Whoops")));
  const submitFn = jest.fn(() => null);

  const EnhancedForm = injectForm(
    props => ({ aField: "foo", bField: "" }),
    submitFn,
    {
      aField: aFieldValidator
    }
  )(MyForm);

  const tree = mount(<EnhancedForm />);

  const firstRender = CompnentsLatestCall(MyForm);
  firstRender.form.setField(["aField"], "baz");

  expect(aFieldValidator).toHaveBeenCalledTimes(1);

  const secondRender = CompnentsLatestCall(MyForm);
  expect(secondRender.form.submit()).rejects.toThrow(
    "Form has validation errors"
  );

  expect(submitFn).toHaveBeenCalledTimes(0);
});

test("Submission fires validation of not-yet-validated fields and then resubmits once valid", async () => {
  const MyForm = jest.fn(() => null);
  const aFieldValidator = jest.fn(() => true);
  const submitFn = jest.fn(() => Promise.resolve());

  const EnhancedForm = injectForm(
    props => ({ aField: "foo", bField: "" }),
    submitFn,
    {
      aField: aFieldValidator
    }
  )(MyForm);

  const tree = mount(<EnhancedForm />);

  const firstRender = CompnentsLatestCall(MyForm);
  expect(aFieldValidator).toHaveBeenCalledTimes(0);
  await firstRender.form.submit();
  expect(aFieldValidator).toHaveBeenCalledTimes(1);
  expect(submitFn).toHaveBeenCalledTimes(1);
});

function CompnentsLatestCall(spiedComponent) {
  const calls = spiedComponent.mock.calls;

  return calls[calls.length - 1][0];
}

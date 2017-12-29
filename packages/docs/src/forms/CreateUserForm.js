import React from "react";
import { compose } from "recompose";
import { withRouter } from "react-router";
import { injectForm } from "@trioxis/react-form";

function Form(props) {
  const { form: { model, setField, submit, validation } } = props;

  return (
    <form onSubmit={submit}>
      <label>Username</label>
      <input
        type="text"
        value={model.username}
        onChange={e => setField(["username"], e.target.value)}
      />
      <label>Password</label>
      <input
        type="text"
        value={model.password}
        onChange={e => setField(["password"], e.target.value)}
      />
      <pre>{JSON.stringify(validation, null, "  ")}</pre>
      <input type="submit" />
    </form>
  );
}

export default compose(
  withRouter,
  injectForm(
    props => ({
      username: "",
      password: ""
    }),
    (props, model) => {
      console.log(props, model);
      props.history.push("/two");
    },
    props => ({
      username: val => checkUsernameAvailability(val),
      password: val => val.length > 0 || [new Error("Password too short")]
    })
  )
)(Form);

async function checkUsernameAvailability() {
  return new Promise(r => setTimeout(() => r(true), 2000));
}

async function checkForDuplicateEmail() {
  return new Promise(r => setTimeout(() => r(true), 2000));
}

function emptyData() {
  return {
    username: "",
    password: "",
    email: ""
  };
}

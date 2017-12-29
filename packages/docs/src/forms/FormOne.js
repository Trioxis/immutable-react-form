import React from "react";
import { compose } from "recompose";
import { withRouter } from "react-router";
import { injectForm } from "@trioxis/react-form";

function Form(props) {
  const { form: { model, setField, submit } } = props;

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
    }
  )
)(Form);

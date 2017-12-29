import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from "react-router-dom";

import FormOne from "./forms/FormOne";
import FormTwo from "./forms/FormTwo";
import FormThree from "./forms/CreateUserForm";

function App() {
  return (
    <Router className="App">
      <Switch>
        <Route path="/one" component={FormOne} />
        <Route path="/two" component={FormTwo} />
        <Route path="/three" component={FormThree} />
        <Redirect path="/" to="/one" />
      </Switch>
    </Router>
  );
}

export default App;

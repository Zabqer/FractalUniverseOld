import React from "react";
import ReactDOM from "react-dom";

import "@babel/polyfill"

import UI from "../UI/UI";

import { BrowserRouter as Router } from "react-router-dom";

import FractalUniverse from "./FractalUniverse";

import "../styles/index.sass";

window.FU = FractalUniverse;

console.log("%c%s", "padding: 1rem; background: linear-gradient(gold, orangered); text-shadow: 0 2px orangered; font: 1.3rem/3 Arial; color: white;", gettext("This is only for developers! Don't copy-paste something from this to other peoples!"))

FractalUniverse.init().then(() => {
  ReactDOM.render((
      <Router>
        <UI />
      </Router>
  ), document.getElementById("app"));
});

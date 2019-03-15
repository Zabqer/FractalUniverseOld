import React from "react";
import ReactDOM from "react-dom";

import '@babel/polyfill'

import UI from "../UI/UI";

import { BrowserRouter as Router } from "react-router-dom";

import FractalUniverse from "./FractalUniverse";

import "../styles/index.sass";

window.FU = FractalUniverse;

FractalUniverse.init();

ReactDOM.render((
    <Router>
      <UI />
    </Router>
), document.getElementById("app"));

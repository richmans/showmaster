import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import '../css/bootstrap.min.css';
import '../css/showoff.css';
import $ from '../js/jquery.min.js';
//import '../js/bootstrap.min.js';

var url="/programs/kvdnznstd_christmas.json";
$.get(url,function(data) {
  console.log(data)
  ReactDOM.render(
    <App schedule={data}/>,
    document.getElementById('root')
  )
})
.fail(function(e) {
  console.error("Could not retrieve program");
  console.error(e);
})

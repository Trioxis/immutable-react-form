import React from 'react';
import ReactDOM from 'react-dom';

function MainComponent(props){
  return <div>
    Hello world
  </div>
}

ReactDOM.render(
  <MainComponent />,
  document.getElementById('root')
);

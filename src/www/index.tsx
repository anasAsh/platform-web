import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import { reducer } from './redux/reducer';
import { start, getConversation } from './redux/actions';

const store = createStore(reducer);
start(store);
setInterval(() => {
  getConversation(store);
}, 300);

import Chat from './components/chat';

ReactDOM.render(
  <Provider store={store}>
    <Chat />
  </Provider>,
  document.getElementById("root")
);

import { Action, Store, Dispatch } from 'redux';
import * as fetch from 'isomorphic-fetch';

import { State, Conversations } from './store';
import { WebPostbackMessage, WebTextMessage } from '../../web';

export type Actions = SetState | SetConversation;

export interface SetState extends Action {
  type: 'STATE-SET';
  state: State;
};

export interface SetConversation extends Action {
  type: 'CONVERSATION-SET';
  conversation: Conversations;
};

function checkFetchStatus(response: IResponse) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(response.statusText);
    throw error;
  }
}

function parseJSON(response: IResponse) {
  return response.json();
}

export function start(store: Store<State>) {
  fetch('/api/start', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({}),
    })
    .then(checkFetchStatus)
    .then(parseJSON)
    .then((response: any) => {
      const action: SetState = {
        type: 'STATE-SET',
        state: response,
      };
      store.dispatch(action);
    });
}

export function getConversation(store: Store<State>) {
  fetch('/api/conversation', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        userid: store.getState().userid,
      }),
    })
    .then(checkFetchStatus)
    .then(parseJSON)
    .then((response: any) => {
      const action: SetConversation = {
        type: 'CONVERSATION-SET',
        conversation: response,
      };
      store.dispatch(action);
    });
}

export function sendText(userid: string, text: string) {
  return (dispatch: Dispatch<State>) => {
    const message: WebTextMessage = {
      userid: userid,
      text: text,
      type: 'text',
    };
    fetch('/api/receive', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify(message),
    })
    .then(checkFetchStatus)
    .then(parseJSON)
    .then((response: any) => {
      return;
    })
    .catch((err: Error) => {
      console.log(err);
    });
  };
}

export function sendPostback(userid: string, payload: string) {
  return (dispatch: Dispatch<State>) => {
    const message: WebPostbackMessage = {
      userid: userid,
      payload: payload,
      type: 'postback',
    };
    fetch('/api/receive', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify(message),
    })
    .then(checkFetchStatus)
    .then(parseJSON)
    .then((response: any) => {
      return;
    })
    .catch((err: Error) => {
      console.log(err);
    });
  };
}

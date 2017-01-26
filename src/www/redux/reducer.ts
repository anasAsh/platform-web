import { createStore, applyMiddleware, Action, Reducer } from 'redux';
import { defaultState, State } from './store';
import { Actions } from './actions';
import * as _ from 'lodash';

export const reducer: Reducer<State> = (state: State = defaultState, action: Actions): State => {
  const clone = _.cloneDeep(state);
  switch (action.type) {
    case 'STATE-SET':
      return action.state;

    case 'CONVERSATION-SET':
      clone.conversation = action.conversation;
      return clone;

    default:
      return state;
  }
};

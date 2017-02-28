import { MessengerPayload } from 'facebook-sendapi-types';

export type Conversations = Array<MessengerPayload>;

export interface State {
  userid: string;
  conversation: Conversations;
  pageid: string;
  token: string;
};

export const defaultState: State = {
  userid: null,
  pageid: null,
  conversation: [],
  token: null,
};

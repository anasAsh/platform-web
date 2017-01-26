import { MessengerPayload } from 'facebook-sendapi-types';
export declare type Conversations = Array<MessengerPayload>;
export interface State {
    userid: string;
    conversation: Conversations;
    pageid: string;
}
export declare const defaultState: State;

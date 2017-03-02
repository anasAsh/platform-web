/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import * as SendTypes from 'facebook-sendapi-types';
import Alana from 'alana-core';
import { IncomingMessage, OutgoingMessage } from 'alana-core/lib/types/message';
import { PlatformMiddleware } from 'alana-core/lib/types/platform';
import { User } from 'alana-core/lib/types/user';
export interface WebMessageBase {
    userid: string;
    token: string;
}
export interface WebPostbackMessage extends WebMessageBase {
    type: 'postback';
    payload: string;
    text?: string;
}
export interface WebTextMessage extends WebMessageBase {
    type: 'text';
    text: string;
}
export interface WebGreetingMessage extends WebMessageBase {
    type: 'greeting';
}
export declare type WebMessage = WebPostbackMessage | WebTextMessage | WebGreetingMessage;
export default class Web implements PlatformMiddleware {
    private bot;
    private localApp;
    private localServer;
    private localPort;
    static convertToAlana: typeof convertToAlana;
    static convertFromAlana: typeof convertFromAlana;
    constructor(theBot: Alana, port?: number, fbport?: number);
    start(): Promise<this>;
    stop(): Promise<this>;
    send<U extends User>(user: U, message: OutgoingMessage): Promise<this>;
    private getUserConversation(userId);
}
export declare function convertToAlana(receivedMessage: WebMessage): OutgoingMessage | IncomingMessage;
export declare function convertFromAlana(message: OutgoingMessage | IncomingMessage): SendTypes.MessengerMessage;

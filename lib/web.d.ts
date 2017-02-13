/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import Botler from 'botler';
import { Message, IncomingMessage } from 'botler/lib/types/message';
import { PlatformMiddleware } from 'botler/lib/types/platform';
import { User } from 'botler/lib/types/user';
export interface WebMessage {
    type: string;
    userid: string;
    token: string;
}
export interface WebPostbackMessage extends WebMessage {
    type: 'postback';
    payload: string;
}
export interface WebTextMessage extends WebMessage {
    type: 'text';
    text: string;
}
export default class Web implements PlatformMiddleware {
    private bot;
    private localApp;
    private localServer;
    private localPort;
    static convertToBotler: typeof convertToBotler;
    static convertFromBolter: typeof convertFromBolter;
    constructor(botler: Botler, port?: number, fbport?: number);
    start(): Promise<this>;
    stop(): Promise<this>;
    send<U extends User, M extends Message>(user: U, message: M): Promise<this>;
    private getUserConversation(userId);
}
export declare function convertToBotler(receivedMessage: WebMessage & WebPostbackMessage & WebTextMessage): IncomingMessage;
export declare function convertFromBolter<W extends WebMessage>(message: Message): W;

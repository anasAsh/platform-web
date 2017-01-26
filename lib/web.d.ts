/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import Botler from 'botler';
import { Message } from 'botler/lib/types/message';
import { PlatformMiddleware } from 'botler/lib/types/platform';
import { User } from 'botler/lib/types/user';
export interface WebPostbackMessage {
    type: 'postback';
    userid: string;
    payload: string;
}
export interface WebTextMessage {
    type: 'text';
    userid: string;
    text: string;
}
export default class Web implements PlatformMiddleware {
    private bot;
    private localApp;
    private localServer;
    private localPort;
    constructor(botler: Botler, port?: number, fbport?: number);
    start(): Promise<this>;
    stop(): Promise<this>;
    send<U extends User, M extends Message>(user: U, message: M): Promise<this>;
    private getUserConversation(userId);
}

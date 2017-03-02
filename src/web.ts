import * as Promise from 'bluebird';
import * as bodyParser from 'body-parser';
import * as Express from 'express';
import FB from 'facebook-send-api';
import * as SendTypes from 'facebook-sendapi-types';
import * as http from 'http';
import * as _ from 'lodash';

import Alana from 'alana-core';
import { mapInternalToFB } from 'alana-platform-facebook';

import { Message, TextMessage, IncomingMessage, PostbackMessage, GreetingMessage, OutgoingMessage } from 'alana-core/lib/types/message';
import { PlatformMiddleware } from 'alana-core/lib/types/platform';
import { BasicUser, User } from 'alana-core/lib/types/user';
import { State } from './www/redux/store';

const savedConversation: { [id: string]: Array<SendTypes.MessengerPayload> } = {};
const PAGEID = 'page';

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

export type WebMessage = WebPostbackMessage | WebTextMessage | WebGreetingMessage;

export default class Web implements PlatformMiddleware {
  private bot: Alana;
  private localApp: Express.Express;
  private localServer: http.Server = null;
  private localPort: number;
  static convertToAlana = convertToAlana;
  static convertFromAlana = convertFromAlana;

  constructor(theBot: Alana, port: number = 3000, fbport: number = 4100) {
    this.bot = theBot;
    this.bot.addPlatform(this);
    this.localPort = port;
    this.localApp = Express();
    this.localApp.use(bodyParser.json());
    this.localApp.use(Express.static(`${__dirname}/dist`));

    this.localApp.post('/api/conversation', (req, res, next) => {
      const user: BasicUser = {
        id: '0',
        platform: 'web',
        _platform: this,
      };
      if (_.has(savedConversation, [`${user.platform}${user.id.toString()}`]) === false) {
        return res.send([]);
      }
      return this.getUserConversation(req.body.userid.toString())
        .then((conversation) => res.send(conversation));
    });

    this.localApp.post('/api/receive', (req, res, next) => {
      // send to bot
      const user: BasicUser = {
        id: req.body.userid,
        platform: 'web',
        _platform: this,
      };

      const message = convertToAlana(req.body);

      const fbMessage: SendTypes.MessengerPayload = {
        recipient: {
          id: PAGEID,
        },
        message: convertFromAlana(message),
      };

      _.update(savedConversation, [`${user.platform}${user.id.toString()}`], (n: Array<SendTypes.MessengerPayload>) => {
        return n ? n.concat(fbMessage) : [ fbMessage ];
      });

      this.bot.processMessage(user, message as IncomingMessage);
    });

    this.localApp.post('/api/start', (req, res, next) => {
      const user: BasicUser = {
        id: '0',
        platform: 'web',
        _platform: this,
      };
      if (_.has(savedConversation, [`${user.platform}${user.id.toString()}`])) {
        return this.getUserConversation(user.id)
          .then((conversation) => {
            const state: State = {
              userid: user.id,
              conversation: conversation,
              pageid: PAGEID,
              token: 'correct',
            };
            res.send(state);
          });
      }
      console.log('new user');
      this.bot.processGreeting(user)
        .then(() => {
          const state: State = {
            userid: user.id,
            conversation: [],
            pageid: PAGEID,
            token: 'correct',
          };
          return res.send(state);
        });
      return;
    });
  }

  public start() {
    this.localServer = this.localApp.listen(this.localPort, () => {
      if (this.bot.debugOn) {
        console.log(`Web platform listening on port ${this.localPort}`);
      }
    });
    return Promise.resolve(this);
  }

  public stop() {
    this.localServer.close(() => {
      if (this.bot.debugOn) {
        console.log('Web platform stopped');
      }
    });
    this.localServer = null;

    return Promise.resolve(this);
  }

  public send <U extends User>(user: U, message: OutgoingMessage): Promise<this> {
    const fbMessage: SendTypes.MessengerPayload = {
      recipient: {
        id: user.id,
      },
      message: convertFromAlana(message),
    };
    _.update(savedConversation, [`${user.platform}${user.id.toString()}`], (n: Array<SendTypes.MessengerPayload>) => {
      return n ? n.concat(fbMessage) : [ fbMessage ];
    });
    console.log(savedConversation);
    return Promise.resolve(this);
  }

  private getUserConversation(userId: string): Promise<Array<SendTypes.MessengerPayload>> {
    const user: BasicUser = {
      _platform: this,
      id: userId,
      platform: 'web',
    };
    let conversation: Array<SendTypes.MessengerPayload> = savedConversation[`${user.platform}${user.id.toString()}`];

    return Promise.resolve(conversation);
  }

}

export function convertToAlana(receivedMessage: WebMessage): OutgoingMessage | IncomingMessage {
  let message: IncomingMessage;
  switch (receivedMessage.type) {
    case 'postback':
      message = {
        type: 'postback',
        payload: receivedMessage.payload,
      } as PostbackMessage;
      break;

    case 'text':
      message = {
        type: 'text',
        text: receivedMessage.text,
      } as TextMessage;
      break;

    case 'greeting':
      message = {
        type: 'greeting',
      } as GreetingMessage;
      break;

    default:
      throw new Error('bad message type');
  }
  return message;
}

export function convertFromAlana(message: OutgoingMessage | IncomingMessage): SendTypes.MessengerMessage {
  switch (message.type) {
    case 'text':
     return {
       text: message.text,
     };
    case 'image':
      return {
        attachment: {
          type: 'image',
          payload: {
            url: message.url,
          },
        },
      };
  }
}

"use strict";
var Promise = require("bluebird");
var bodyParser = require("body-parser");
var Express = require("express");
var _ = require("lodash");
var botler_platform_facebook_1 = require("botler-platform-facebook");
var savedConversation = {};
var PAGEID = 'page';
var Web = (function () {
    function Web(botler, port, fbport) {
        if (port === void 0) { port = 3000; }
        if (fbport === void 0) { fbport = 4100; }
        var _this = this;
        this.localServer = null;
        this.bot = botler;
        this.localPort = port;
        this.localApp = Express();
        this.localApp.use(bodyParser.json());
        this.localApp.use(Express.static(__dirname + "/web"));
        this.localApp.post('/api/conversation', function (req, res, next) {
            var user = {
                id: '0',
                platform: 'web',
                _platform: _this,
            };
            if (_.has(savedConversation, ["" + user.platform + user.id.toString()]) === false) {
                return res.send([]);
            }
            return _this.getUserConversation(req.body.userid.toString())
                .then(function (conversation) { return res.send(conversation); });
        });
        this.localApp.post('/api/receive', function (req, res, next) {
            // send to bot
            var user = {
                id: req.body.userid,
                platform: 'web',
                _platform: _this,
            };
            var message;
            switch (req.body.type) {
                case 'postback':
                    message = {
                        type: 'postback',
                        payload: req.body.payload,
                    };
                    break;
                case 'text':
                    message = {
                        type: 'text',
                        text: req.body.text,
                    };
                    break;
                default:
                    throw new Error('bad message type');
            }
            var fbMessage = {
                recipient: {
                    id: PAGEID,
                },
                message: botler_platform_facebook_1.mapInternalToFB(message),
            };
            _.update(savedConversation, ["" + user.platform + user.id.toString()], function (n) {
                return n ? n.concat(fbMessage) : [fbMessage];
            });
            _this.bot.processMessage(user, message);
        });
        this.localApp.post('/api/start', function (req, res, next) {
            var user = {
                id: '0',
                platform: 'web',
                _platform: _this,
            };
            if (_.has(savedConversation, ["" + user.platform + user.id.toString()])) {
                return _this.getUserConversation(user.id)
                    .then(function (conversation) {
                    var state = {
                        userid: user.id,
                        conversation: conversation,
                        pageid: PAGEID,
                    };
                    res.send(state);
                });
            }
            console.log('new user');
            _this.bot.processGreeting(user)
                .then(function () {
                var state = {
                    userid: user.id,
                    conversation: [],
                    pageid: PAGEID,
                };
                return res.send(state);
            });
            return;
        });
    }
    Web.prototype.start = function () {
        var _this = this;
        this.localServer = this.localApp.listen(this.localPort, function () {
            if (_this.bot.debugOn) {
                console.log("Web platform listening on port " + _this.localPort);
            }
        });
        return Promise.resolve(this);
    };
    Web.prototype.stop = function () {
        var _this = this;
        this.localServer.close(function () {
            if (_this.bot.debugOn) {
                console.log('Web platform stopped');
            }
        });
        this.localServer = null;
        return Promise.resolve(this);
    };
    Web.prototype.send = function (user, message) {
        var fbMessage = {
            recipient: {
                id: user.id,
            },
            message: botler_platform_facebook_1.mapInternalToFB(message),
        };
        _.update(savedConversation, ["" + user.platform + user.id.toString()], function (n) {
            return n ? n.concat(fbMessage) : [fbMessage];
        });
        console.log(savedConversation);
        return Promise.resolve(this);
    };
    Web.prototype.getUserConversation = function (userId) {
        var user = {
            _platform: this,
            id: userId,
            platform: 'web',
        };
        var conversation = savedConversation["" + user.platform + user.id.toString()];
        return Promise.resolve(conversation);
    };
    return Web;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Web;

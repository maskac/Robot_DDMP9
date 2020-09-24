(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WallClient = exports.WallClient = function () {
    function WallClient(host, port, path) {
        var _this = this;

        var qos = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

        _classCallCheck(this, WallClient);

        this.qos = qos;
        this.clientId = WallClient.generateClientId();

        // paho documentation: http://www.eclipse.org/paho/files/jsdoc/index.html
        this.client = new Paho.MQTT.Client(host, port, path, this.clientId);

        this.client.onMessageArrived = function (message) {
            //console.log("Message arrived ", message);
            _this.onMessage(message.destinationName, message.payloadString, message.retained, message.qos);
        };

        this.client.onConnectionLost = function (error) {
            console.info("Connection lost ", error);

            if (WallClient.isNetworkError(error.errorCode)) {
                _this._reconnect();
                return;
            }

            _this.onError("Connection lost (" + error.errorMessage + ")", true);
        };

        this.currentTopic = null;

        this.onConnected = $.noop();
        this.onMessage = $.noop();
        this.onError = $.noop();
        this.onStateChanged = $.noop();

        this.firstConnection = true;
        this.attempts = 0;
        this._setState(WallClient.STATE.NEW);
    }

    _createClass(WallClient, [{
        key: "subscribe",
        value: function subscribe(topic, fn) {
            var _this2 = this;

            // unsubscribe current topic (if exists)
            if (this.currentTopic !== null && this.currentTopic !== topic) {
                (function () {
                    var oldTopic = _this2.currentTopic;
                    _this2.client.unsubscribe(oldTopic, {
                        onSuccess: function onSuccess() {
                            console.info("Unsubscribe '%s' success", oldTopic);
                        },
                        onFailure: function onFailure(error) {
                            console.error("Unsubscribe '%s' failure", oldTopic, error);
                        }
                    });
                })();
            }

            // subscribe new topic
            this.client.subscribe(topic, {
                qos: this.qos,
                onSuccess: function onSuccess(r) {
                    console.info("Subscribe '%s' success", topic, r);
                    if (fn) {
                        fn();
                    }
                },
                onFailure: function onFailure(r) {
                    console.error("subscribe '%s' failure", topic, r);
                    _this2.onError("Subscribe failure");
                }
            });

            this.currentTopic = topic;
        }
    }, {
        key: "connect",
        value: function connect() {
            var _this3 = this;

            var connectOptions = {

                onSuccess: function onSuccess() {
                    console.info("Connect success");

                    _this3.attempts = 0;
                    _this3._setState(WallClient.STATE.CONNECTED);

                    if (_this3.firstConnection) {
                        _this3.firstConnection = false;
                        _this3.onConnected();
                    } else {
                        _this3.subscribe(_this3.currentTopic);
                    }
                },

                onFailure: function onFailure(error) {
                    console.error("Connect fail ", error);

                    if (WallClient.isNetworkError(error.errorCode)) {
                        _this3._reconnect();
                        return;
                    }

                    _this3.onError("Fail to connect", true);
                }
            };

            this._setState(this.firstConnection ? WallClient.STATE.CONNECTING : WallClient.STATE.RECONNECTING);

            this.client.connect(connectOptions);
        }
    }, {
        key: "_reconnect",
        value: function _reconnect() {
            var _this4 = this;

            this.attempts++;
            this._setState(this.firstConnection ? WallClient.STATE.CONNECTING : WallClient.STATE.RECONNECTING);

            var t = (this.attempts - 1) * 2000;
            t = Math.max(Math.min(t, 30000), 100);

            setTimeout(function () {
                _this4.connect();
            }, t);
        }
    }, {
        key: "_setState",
        value: function _setState(state) {
            this.state = state;

            if (this.onStateChanged) this.onStateChanged(state);
        }
    }, {
        key: "toString",
        value: function toString() {
            var str = this.client.host;

            if (this.client.port != 80) {
                str += ":" + this.client.port;
            }

            if (this.client.path != "") {
                str += "" + this.client.path;
            }

            return str;
        }
    }], [{
        key: "generateClientId",
        value: function generateClientId() {
            var time = Date.now() % 1000;
            var rnd = Math.round(Math.random() * 1000);
            return "wall-" + (time * 1000 + rnd);
        }
    }, {
        key: "isNetworkError",
        value: function isNetworkError(code) {
            // possible codes: https://github.com/eclipse/paho.mqtt.javascript/blob/master/src/mqttws31.js#L166
            var networkErrors = [1 /* CONNECT_TIMEOUT */
            , 2 /* SUBSCRIBE_TIMEOUT */
            , 3 /* UNSUBSCRIBE_TIMEOUT */
            , 4 /* PING_TIMEOUT */
            , 6 /* CONNACK_RETURNCODE */
            , 7 /* SOCKET_ERROR */
            , 8 /* SOCKET_CLOSE */
            , 9 /* MALFORMED_UTF */
            , 11 /* INVALID_STATE */
            , 12 /* INVALID_TYPE */
            , 15 /* INVALID_STORED_DATA */
            , 16 /* INVALID_MQTT_MESSAGE_TYPE */
            , 17 /* MALFORMED_UNICODE */
            ];
            return networkErrors.indexOf(code) >= 0;
        }
    }]);

    return WallClient;
}();

WallClient.STATE = {
    NEW: 0,
    CONNECTING: 1,
    CONNECTED: 2,
    RECONNECTING: 3,
    ERROR: 99
};

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Toolbar = exports.Footer = exports.MessageContainer = exports.MessageLine = exports.UI = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils.js');

var _client = require('./client.js');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UI = exports.UI = {};

UI.setTitle = function (topic) {
    document.title = "MQTT Wall" + (topic ? " for " + topic : "");
};

UI.toast = function (message) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "info";
    var persistent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    return new Toast(message, type, persistent);
};

var Toast = function () {
    function Toast(message) {
        var _this = this;

        var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "info";
        var persistent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        _classCallCheck(this, Toast);

        this.$root = $("<div class='toast-item'>").text(message).addClass(type).hide().appendTo("#toast").fadeIn();

        if (persistent) {
            this.$root.addClass("persistent");
        } else {
            setTimeout(function () {
                _this.hide();
            }, 5000);
        }
    }

    _createClass(Toast, [{
        key: 'hide',
        value: function hide() {
            var _this2 = this;

            this.$root.slideUp().queue(function () {
                _this2.remove();
            });
        }
    }, {
        key: 'remove',
        value: function remove() {
            this.$root.remove();
        }
    }, {
        key: 'setMessage',
        value: function setMessage(message) {
            this.$root.text(message);
        }
    }]);

    return Toast;
}();

var MessageLine = exports.MessageLine = function () {
    function MessageLine(topic) {
        _classCallCheck(this, MessageLine);

        this.topic = topic;
        this.counter = 0;
        this.isNew = true;
        this.init();
    }

    _createClass(MessageLine, [{
        key: 'init',
        value: function init() {
            this.$root = $("<article class='message'>");

            var header = $("<header>").appendTo(this.$root);

            $("<h2>").text(this.topic).appendTo(header);

            if (window.config.showCounter) {
                this.$counterMark = $("<span class='mark counter' title='Message counter'>0</span>").appendTo(header);
            }

            this.$retainMark = $("<span class='mark retain' title='Retain message'>R</span>").appendTo(header);

            this.$qosMark = $("<span class='mark qos' title='Received message QoS'>QoS</span>").appendTo(header);

            this.$payload = $("<p>").appendTo(this.$root);
        }
    }, {
        key: 'highlight',
        value: function highlight() {
            var line = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            (line ? this.$root : this.$payload).stop().css({ backgroundColor: "#0CB0FF" }).animate({ backgroundColor: "#fff" }, 2000);
        }
    }, {
        key: 'update',
        value: function update(payload, retained, qos) {
            this.counter++;
            this.isRetained = retained;

            if (this.$counterMark) {
                this.$counterMark.text(this.counter);
            }

            if (this.$qosMark) {
                if (qos == 0) {
                    this.$qosMark.hide();
                } else {
                    this.$qosMark.show();
                    this.$qosMark.text('QoS ' + qos);
                    this.$qosMark.attr("data-qos", qos);
                }
            }

            if (payload == "") {
                payload = "NULL";
                this.isSystemPayload = true;
            } else {
                this.isSystemPayload = false;
            }

            this.$payload.text(payload);
            this.highlight(this.isNew);

            if (this.isNew) {
                this.isNew = false;
            }
        }
    }, {
        key: 'isRetained',
        set: function set(value) {
            this.$retainMark[value ? 'show' : 'hide']();
        }
    }, {
        key: 'isSystemPayload',
        set: function set(value) {
            this.$payload.toggleClass("sys", value);
        }
    }]);

    return MessageLine;
}();

var MessageContainer = exports.MessageContainer = function () {
    function MessageContainer($parent) {
        _classCallCheck(this, MessageContainer);

        this.sort = 'Alphabetically';
        this.$parent = $parent;
        this.init();
    }

    _createClass(MessageContainer, [{
        key: 'init',
        value: function init() {
            this.reset();
        }
    }, {
        key: 'reset',
        value: function reset() {
            this.lines = {};
            this.topics = [];
            this.$parent.html("");
        }
    }, {
        key: 'update',
        value: function update(topic, payload, retained, qos) {

            if (!this.lines[topic]) {

                var line = new MessageLine(topic, this.$parent);

                this['addLine' + this.sort](line);
                this.lines[topic] = line;
            }

            this.lines[topic].update(payload, retained, qos);
        }
    }, {
        key: 'addLineAlphabetically',
        value: function addLineAlphabetically(line) {

            if (this.topics.length == 0) {
                this.addLineChronologically(line);
                return;
            }

            var topic = line.topic;

            this.topics.push(topic);
            this.topics.sort();

            var n = this.topics.indexOf(topic);

            if (n == 0) {
                this.$parent.prepend(line.$root);
                return;
            }

            var prev = this.topics[n - 1];
            line.$root.insertAfter(this.lines[prev].$root);
        }
    }, {
        key: 'addLineChronologically',
        value: function addLineChronologically(line) {
            this.topics.push(line.topic);
            this.$parent.append(line.$root);
        }
    }]);

    return MessageContainer;
}();

MessageContainer.SORT_APLHA = "Alphabetically";
MessageContainer.SORT_CHRONO = "Chronologically";

var Footer = exports.Footer = function () {
    function Footer() {
        _classCallCheck(this, Footer);
    }

    _createClass(Footer, [{
        key: 'clientId',
        set: function set(value) {
            $("#status-client").text(value);
        }
    }, {
        key: 'host',
        set: function set(value) {
            $("#status-host").text("ws://" + value);
        }
    }, {
        key: 'state',
        set: function set(value) {
            var text = void 0,
                className = void 0;

            switch (value) {
                case _client.WallClient.STATE.NEW:
                    text = "";
                    className = "connecting";
                    break;
                case _client.WallClient.STATE.CONNECTING:
                    text = "connecting...";
                    className = "connecting";
                    break;
                case _client.WallClient.STATE.CONNECTED:
                    text = "connected";
                    className = "connected";
                    break;
                case _client.WallClient.STATE.RECONNECTING:
                    text = "reconnecting...";
                    className = "connecting";
                    break;
                case _client.WallClient.STATE.ERROR:
                    text = "not connected";
                    className = "fail";
                    break;
                default:
                    throw new Error("Unknown WallClient.STATE");
            }

            if (this.reconnectAttempts > 1) {
                text += ' (' + this.reconnectAttempts + ')';
            }

            $("#status-state").removeClass().addClass(className);
            $("#status-state span").text(text);
        }
    }]);

    return Footer;
}();

var Toolbar = exports.Toolbar = function (_EventEmitter) {
    _inherits(Toolbar, _EventEmitter);

    function Toolbar(parent) {
        _classCallCheck(this, Toolbar);

        var _this3 = _possibleConstructorReturn(this, (Toolbar.__proto__ || Object.getPrototypeOf(Toolbar)).call(this));

        _this3.$parent = parent;
        _this3.$topic = parent.find("#topic");

        _this3.initEventHandlers();
        _this3.initDefaultTopic();
        return _this3;
    }

    _createClass(Toolbar, [{
        key: 'initEventHandlers',
        value: function initEventHandlers() {
            var _this4 = this;

            var inhibitor = false;

            this.$topic.keyup(function (e) {
                if (e.which === 13) {
                    // ENTER
                    _this4.$topic.blur();
                }

                if (e.keyCode === 27) {
                    // ESC
                    inhibitor = true;
                    _this4.$topic.blur();
                }
            });

            this.$topic.focus(function (e) {
                inhibitor = false;
            });

            this.$topic.blur(function (e) {
                if (inhibitor) {
                    _this4.updateUi(); // revert changes
                } else {
                    _this4.inputChanged();
                }
            });
        }
    }, {
        key: 'inputChanged',
        value: function inputChanged() {
            var newTopic = this.$topic.val();

            if (newTopic === this._topic) {
                return;
            }

            this._topic = newTopic;
            this.emit("topic", newTopic);
        }
    }, {
        key: 'initDefaultTopic',
        value: function initDefaultTopic() {
            // URL hash 
            if (location.hash !== "") {
                this._topic = location.hash.substr(1);
            } else {
                this._topic = config.defaultTopic || "/#";
            }

            this.updateUi();
        }
    }, {
        key: 'updateUi',
        value: function updateUi() {
            this.$topic.val(this._topic);
        }
    }, {
        key: 'topic',
        get: function get() {
            return this._topic;
        },
        set: function set(value) {
            this._topic = value;
            this.updateUi();
            this.emit("topic", value);
        }
    }]);

    return Toolbar;
}(_utils.EventEmitter);

},{"./client.js":1,"./utils.js":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Simple version of node.js's EventEmiter class
 */
var EventEmitter = exports.EventEmitter = function () {
    function EventEmitter() {
        _classCallCheck(this, EventEmitter);
    }

    _createClass(EventEmitter, [{
        key: 'on',


        /**
         * Add event handler of givent type
         */
        value: function on(type, fn) {
            if (this['_on' + type] === undefined) {
                this['_on' + type] = [];
            }

            this['_on' + type].push(fn);
        }

        /**
         * Emit event of type.
         * 
         * All arguments will be applay to callback, preserve context of object this.
         */

    }, {
        key: 'emit',
        value: function emit(type) {
            var _this = this;

            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            if (this['_on' + type]) {
                this['_on' + type].forEach(function (fn) {
                    return fn.apply(_this, args);
                });
            }
        }
    }]);

    return EventEmitter;
}();

},{}],4:[function(require,module,exports){
"use strict";

var _client = require("./client.js");

var _ui = require("./ui.js");

// --- Main -------------------------------------------------------------------

var client = new _client.WallClient(config.server.host, config.server.port, config.server.path, config.qos);
var messages = new _ui.MessageContainer($("section.messages"));
var footer = new _ui.Footer();
var toolbar = new _ui.Toolbar($("#header"));

messages.sort = config.alphabeticalSort ? _ui.MessageContainer.SORT_APLHA : _ui.MessageContainer.SORT_CHRONO;

footer.clientId = client.clientId;
footer.host = client.toString();
footer.state = 0;

function load() {
    var topic = toolbar.topic;

    client.subscribe(topic, function () {
        _ui.UI.setTitle(topic);
        location.hash = "#" + topic;
    });

    messages.reset();
}

toolbar.on("topic", function () {
    load();
});

client.onConnected = function () {
    load();
    _ui.UI.toast("Connected to host " + client.toString());
};

client.onError = function (description, isFatal) {
    _ui.UI.toast(description, "error", isFatal);
};

var reconnectingToast = null;

client.onStateChanged = function (state) {
    footer.reconnectAttempts = client.attempts;
    footer.state = state;

    if ((state === _client.WallClient.STATE.CONNECTING || state === _client.WallClient.STATE.RECONNECTING) && client.attempts >= 2) {
        var msg = state === _client.WallClient.STATE.CONNECTING ? "Fail to connect. Trying to connect... (" + client.attempts + " attempts)" : "Connection lost. Trying to reconnect... (" + client.attempts + " attempts)";

        if (reconnectingToast === null) {
            reconnectingToast = _ui.UI.toast(msg, "error", true);
        } else {
            reconnectingToast.setMessage(msg);
        }
    }

    if (state === _client.WallClient.STATE.CONNECTED && reconnectingToast !== null) {
        reconnectingToast.hide();
        reconnectingToast = null;

        if (client.firstConnection == false) {
            _ui.UI.toast("Reconnected");
        }
    }
};

client.onMessage = function (topic, msg, retained, qos) {
    messages.update(topic, msg, retained, qos);
};

client.connect();

},{"./client.js":1,"./ui.js":2}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvY2xpZW50LmpzIiwic3JjL2pzL3VpLmpzIiwic3JjL2pzL3V0aWxzLmpzIiwic3JjL2pzL3dhbGwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7O0lDQWEsVSxXQUFBLFU7QUFFVCx3QkFBWSxJQUFaLEVBQWtCLElBQWxCLEVBQXdCLElBQXhCLEVBQXVDO0FBQUE7O0FBQUEsWUFBVCxHQUFTLHVFQUFILENBQUc7O0FBQUE7O0FBRW5DLGFBQUssR0FBTCxHQUFXLEdBQVg7QUFDQSxhQUFLLFFBQUwsR0FBZ0IsV0FBVyxnQkFBWCxFQUFoQjs7QUFFQTtBQUNBLGFBQUssTUFBTCxHQUFjLElBQUksS0FBSyxJQUFMLENBQVUsTUFBZCxDQUFxQixJQUFyQixFQUEyQixJQUEzQixFQUFpQyxJQUFqQyxFQUF1QyxLQUFLLFFBQTVDLENBQWQ7O0FBRUEsYUFBSyxNQUFMLENBQVksZ0JBQVosR0FBK0IsVUFBQyxPQUFELEVBQWE7QUFDeEM7QUFDQSxrQkFBSyxTQUFMLENBQWUsUUFBUSxlQUF2QixFQUF3QyxRQUFRLGFBQWhELEVBQStELFFBQVEsUUFBdkUsRUFBaUYsUUFBUSxHQUF6RjtBQUNILFNBSEQ7O0FBS0EsYUFBSyxNQUFMLENBQVksZ0JBQVosR0FBK0IsVUFBQyxLQUFELEVBQVc7QUFDdEMsb0JBQVEsSUFBUixDQUFhLGtCQUFiLEVBQWlDLEtBQWpDOztBQUVBLGdCQUFJLFdBQVcsY0FBWCxDQUEwQixNQUFNLFNBQWhDLENBQUosRUFBK0M7QUFDM0Msc0JBQUssVUFBTDtBQUNBO0FBQ0g7O0FBRUQsa0JBQUssT0FBTCx1QkFBaUMsTUFBTSxZQUF2QyxRQUF3RCxJQUF4RDtBQUNILFNBVEQ7O0FBV0EsYUFBSyxZQUFMLEdBQW9CLElBQXBCOztBQUVBLGFBQUssV0FBTCxHQUFtQixFQUFFLElBQUYsRUFBbkI7QUFDQSxhQUFLLFNBQUwsR0FBaUIsRUFBRSxJQUFGLEVBQWpCO0FBQ0EsYUFBSyxPQUFMLEdBQWUsRUFBRSxJQUFGLEVBQWY7QUFDQSxhQUFLLGNBQUwsR0FBc0IsRUFBRSxJQUFGLEVBQXRCOztBQUVBLGFBQUssZUFBTCxHQUF1QixJQUF2QjtBQUNBLGFBQUssUUFBTCxHQUFnQixDQUFoQjtBQUNBLGFBQUssU0FBTCxDQUFlLFdBQVcsS0FBWCxDQUFpQixHQUFoQztBQUNIOzs7O2tDQTRCVSxLLEVBQU8sRSxFQUFJO0FBQUE7O0FBRWxCO0FBQ0EsZ0JBQUksS0FBSyxZQUFMLEtBQXNCLElBQXRCLElBQThCLEtBQUssWUFBTCxLQUFzQixLQUF4RCxFQUErRDtBQUFBO0FBQzNELHdCQUFJLFdBQVcsT0FBSyxZQUFwQjtBQUNBLDJCQUFLLE1BQUwsQ0FBWSxXQUFaLENBQXdCLFFBQXhCLEVBQWtDO0FBQzlCLG1DQUFXLHFCQUFNO0FBQ2Isb0NBQVEsSUFBUixDQUFhLDBCQUFiLEVBQXlDLFFBQXpDO0FBQ0gseUJBSDZCO0FBSTlCLG1DQUFXLG1CQUFDLEtBQUQsRUFBVztBQUNsQixvQ0FBUSxLQUFSLENBQWMsMEJBQWQsRUFBMEMsUUFBMUMsRUFBb0QsS0FBcEQ7QUFDSDtBQU42QixxQkFBbEM7QUFGMkQ7QUFVOUQ7O0FBRUQ7QUFDQSxpQkFBSyxNQUFMLENBQVksU0FBWixDQUFzQixLQUF0QixFQUE2QjtBQUN6QixxQkFBSyxLQUFLLEdBRGU7QUFFekIsMkJBQVcsbUJBQUMsQ0FBRCxFQUFPO0FBQ2QsNEJBQVEsSUFBUixDQUFhLHdCQUFiLEVBQXVDLEtBQXZDLEVBQThDLENBQTlDO0FBQ0Esd0JBQUksRUFBSixFQUFRO0FBQ0o7QUFDSDtBQUNKLGlCQVB3QjtBQVF6QiwyQkFBVyxtQkFBQyxDQUFELEVBQU87QUFDZCw0QkFBUSxLQUFSLENBQWMsd0JBQWQsRUFBd0MsS0FBeEMsRUFBK0MsQ0FBL0M7QUFDQSwyQkFBSyxPQUFMLENBQWEsbUJBQWI7QUFDSDtBQVh3QixhQUE3Qjs7QUFjQSxpQkFBSyxZQUFMLEdBQW9CLEtBQXBCO0FBQ0g7OztrQ0FFVTtBQUFBOztBQUVQLGdCQUFJLGlCQUFpQjs7QUFFakIsMkJBQVkscUJBQU07QUFDZCw0QkFBUSxJQUFSLENBQWEsaUJBQWI7O0FBRUEsMkJBQUssUUFBTCxHQUFnQixDQUFoQjtBQUNBLDJCQUFLLFNBQUwsQ0FBZSxXQUFXLEtBQVgsQ0FBaUIsU0FBaEM7O0FBRUEsd0JBQUksT0FBSyxlQUFULEVBQTBCO0FBQ3RCLCtCQUFLLGVBQUwsR0FBdUIsS0FBdkI7QUFDQSwrQkFBSyxXQUFMO0FBQ0gscUJBSEQsTUFHTztBQUNILCtCQUFLLFNBQUwsQ0FBZSxPQUFLLFlBQXBCO0FBQ0g7QUFDSixpQkFkZ0I7O0FBZ0JqQiwyQkFBWSxtQkFBQyxLQUFELEVBQVc7QUFDbkIsNEJBQVEsS0FBUixDQUFjLGVBQWQsRUFBK0IsS0FBL0I7O0FBRUEsd0JBQUksV0FBVyxjQUFYLENBQTBCLE1BQU0sU0FBaEMsQ0FBSixFQUErQztBQUMzQywrQkFBSyxVQUFMO0FBQ0E7QUFDSDs7QUFFRCwyQkFBSyxPQUFMLENBQWEsaUJBQWIsRUFBZ0MsSUFBaEM7QUFDSDtBQXpCZ0IsYUFBckI7O0FBNEJBLGlCQUFLLFNBQUwsQ0FBZSxLQUFLLGVBQUwsR0FBdUIsV0FBVyxLQUFYLENBQWlCLFVBQXhDLEdBQXFELFdBQVcsS0FBWCxDQUFpQixZQUFyRjs7QUFFQSxpQkFBSyxNQUFMLENBQVksT0FBWixDQUFvQixjQUFwQjtBQUNIOzs7cUNBRWE7QUFBQTs7QUFFVixpQkFBSyxRQUFMO0FBQ0EsaUJBQUssU0FBTCxDQUFlLEtBQUssZUFBTCxHQUF1QixXQUFXLEtBQVgsQ0FBaUIsVUFBeEMsR0FBcUQsV0FBVyxLQUFYLENBQWlCLFlBQXJGOztBQUVBLGdCQUFJLElBQUksQ0FBQyxLQUFLLFFBQUwsR0FBYyxDQUFmLElBQW9CLElBQTVCO0FBQ0EsZ0JBQUksS0FBSyxHQUFMLENBQVMsS0FBSyxHQUFMLENBQVMsQ0FBVCxFQUFZLEtBQVosQ0FBVCxFQUE2QixHQUE3QixDQUFKOztBQUVBLHVCQUFXLFlBQU07QUFDYix1QkFBSyxPQUFMO0FBQ0gsYUFGRCxFQUVHLENBRkg7QUFHSDs7O2tDQUVVLEssRUFBTztBQUNkLGlCQUFLLEtBQUwsR0FBYSxLQUFiOztBQUVBLGdCQUFJLEtBQUssY0FBVCxFQUNJLEtBQUssY0FBTCxDQUFvQixLQUFwQjtBQUNQOzs7bUNBRVc7QUFDUixnQkFBSSxNQUFNLEtBQUssTUFBTCxDQUFZLElBQXRCOztBQUVBLGdCQUFJLEtBQUssTUFBTCxDQUFZLElBQVosSUFBb0IsRUFBeEIsRUFBNEI7QUFDeEIsdUJBQU8sTUFBTSxLQUFLLE1BQUwsQ0FBWSxJQUF6QjtBQUNIOztBQUVELGdCQUFJLEtBQUssTUFBTCxDQUFZLElBQVosSUFBb0IsRUFBeEIsRUFBNEI7QUFDeEIsdUJBQU8sS0FBSyxLQUFLLE1BQUwsQ0FBWSxJQUF4QjtBQUNIOztBQUVELG1CQUFPLEdBQVA7QUFDSDs7OzJDQTlIeUI7QUFDdEIsZ0JBQUksT0FBTyxLQUFLLEdBQUwsS0FBYSxJQUF4QjtBQUNBLGdCQUFJLE1BQU0sS0FBSyxLQUFMLENBQVcsS0FBSyxNQUFMLEtBQWdCLElBQTNCLENBQVY7QUFDQSw4QkFBZSxPQUFLLElBQUwsR0FBWSxHQUEzQjtBQUNIOzs7dUNBRXNCLEksRUFBTTtBQUN6QjtBQUNBLGdCQUFNLGdCQUFnQixDQUNsQixDQURrQixDQUNoQjtBQURnQixjQUVsQixDQUZrQixDQUVoQjtBQUZnQixjQUdsQixDQUhrQixDQUdoQjtBQUhnQixjQUlsQixDQUprQixDQUloQjtBQUpnQixjQUtsQixDQUxrQixDQUtoQjtBQUxnQixjQU1sQixDQU5rQixDQU1oQjtBQU5nQixjQU9sQixDQVBrQixDQU9oQjtBQVBnQixjQVFsQixDQVJrQixDQVFoQjtBQVJnQixjQVNsQixFQVRrQixDQVNmO0FBVGUsY0FVbEIsRUFWa0IsQ0FVZjtBQVZlLGNBV2xCLEVBWGtCLENBV2Y7QUFYZSxjQVlsQixFQVprQixDQVlmO0FBWmUsY0FhbEIsRUFia0IsQ0FhZjtBQWJlLGFBQXRCO0FBZUEsbUJBQU8sY0FBYyxPQUFkLENBQXNCLElBQXRCLEtBQStCLENBQXRDO0FBQ0g7Ozs7OztBQXlHTCxXQUFXLEtBQVgsR0FBbUI7QUFDZixTQUFLLENBRFU7QUFFZixnQkFBWSxDQUZHO0FBR2YsZUFBVyxDQUhJO0FBSWYsa0JBQWMsQ0FKQztBQUtmLFdBQU87QUFMUSxDQUFuQjs7Ozs7Ozs7Ozs7O0FDdktBOztBQUNBOzs7Ozs7OztBQUVPLElBQUksa0JBQUssRUFBVDs7QUFFUCxHQUFHLFFBQUgsR0FBYyxVQUFVLEtBQVYsRUFBaUI7QUFDM0IsYUFBUyxLQUFULEdBQWlCLGVBQWUsUUFBUyxVQUFVLEtBQW5CLEdBQTRCLEVBQTNDLENBQWpCO0FBQ0gsQ0FGRDs7QUFJQSxHQUFHLEtBQUgsR0FBVyxVQUFVLE9BQVYsRUFBc0Q7QUFBQSxRQUFuQyxJQUFtQyx1RUFBNUIsTUFBNEI7QUFBQSxRQUFwQixVQUFvQix1RUFBUCxLQUFPOztBQUM3RCxXQUFPLElBQUksS0FBSixDQUFVLE9BQVYsRUFBbUIsSUFBbkIsRUFBeUIsVUFBekIsQ0FBUDtBQUNILENBRkQ7O0lBSU0sSztBQUVGLG1CQUFhLE9BQWIsRUFBeUQ7QUFBQTs7QUFBQSxZQUFuQyxJQUFtQyx1RUFBNUIsTUFBNEI7QUFBQSxZQUFwQixVQUFvQix1RUFBUCxLQUFPOztBQUFBOztBQUVyRCxhQUFLLEtBQUwsR0FBYSxFQUFFLDBCQUFGLEVBQ1IsSUFEUSxDQUNILE9BREcsRUFFUixRQUZRLENBRUMsSUFGRCxFQUdSLElBSFEsR0FJUixRQUpRLENBSUMsUUFKRCxFQUtSLE1BTFEsRUFBYjs7QUFPQSxZQUFJLFVBQUosRUFBZ0I7QUFDWixpQkFBSyxLQUFMLENBQVcsUUFBWCxDQUFvQixZQUFwQjtBQUNILFNBRkQsTUFFTztBQUNILHVCQUFXLFlBQU07QUFBRSxzQkFBSyxJQUFMO0FBQWMsYUFBakMsRUFBbUMsSUFBbkM7QUFDSDtBQUNKOzs7OytCQUVPO0FBQUE7O0FBQ0osaUJBQUssS0FBTCxDQUFXLE9BQVgsR0FBcUIsS0FBckIsQ0FBMkIsWUFBTTtBQUFFLHVCQUFLLE1BQUw7QUFBZ0IsYUFBbkQ7QUFDSDs7O2lDQUVTO0FBQ04saUJBQUssS0FBTCxDQUFXLE1BQVg7QUFDSDs7O21DQUVXLE8sRUFBUztBQUNqQixpQkFBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixPQUFoQjtBQUNIOzs7Ozs7SUFHUSxXLFdBQUEsVztBQUVULHlCQUFZLEtBQVosRUFBa0I7QUFBQTs7QUFDZCxhQUFLLEtBQUwsR0FBYSxLQUFiO0FBQ0EsYUFBSyxPQUFMLEdBQWUsQ0FBZjtBQUNBLGFBQUssS0FBTCxHQUFhLElBQWI7QUFDQSxhQUFLLElBQUw7QUFDSDs7OzsrQkFFTTtBQUNILGlCQUFLLEtBQUwsR0FBYSxFQUFFLDJCQUFGLENBQWI7O0FBRUEsZ0JBQUksU0FBUyxFQUFFLFVBQUYsRUFBYyxRQUFkLENBQXVCLEtBQUssS0FBNUIsQ0FBYjs7QUFFQSxjQUFFLE1BQUYsRUFDSyxJQURMLENBQ1UsS0FBSyxLQURmLEVBRUssUUFGTCxDQUVjLE1BRmQ7O0FBSUEsZ0JBQUksT0FBTyxNQUFQLENBQWMsV0FBbEIsRUFBK0I7QUFDM0IscUJBQUssWUFBTCxHQUFvQixFQUFFLDZEQUFGLEVBQ2YsUUFEZSxDQUNOLE1BRE0sQ0FBcEI7QUFFSDs7QUFFRCxpQkFBSyxXQUFMLEdBQW1CLEVBQUUsMkRBQUYsRUFDZCxRQURjLENBQ0wsTUFESyxDQUFuQjs7QUFHQSxpQkFBSyxRQUFMLEdBQWdCLEVBQUUsZ0VBQUYsRUFDWCxRQURXLENBQ0YsTUFERSxDQUFoQjs7QUFHQSxpQkFBSyxRQUFMLEdBQWdCLEVBQUUsS0FBRixFQUFTLFFBQVQsQ0FBa0IsS0FBSyxLQUF2QixDQUFoQjtBQUNIOzs7b0NBVXVCO0FBQUEsZ0JBQWQsSUFBYyx1RUFBUCxLQUFPOztBQUNwQixhQUFDLE9BQU8sS0FBSyxLQUFaLEdBQW9CLEtBQUssUUFBMUIsRUFDSyxJQURMLEdBRUssR0FGTCxDQUVTLEVBQUMsaUJBQWlCLFNBQWxCLEVBRlQsRUFHSyxPQUhMLENBR2EsRUFBQyxpQkFBaUIsTUFBbEIsRUFIYixFQUd3QyxJQUh4QztBQUlIOzs7K0JBRU0sTyxFQUFTLFEsRUFBVSxHLEVBQUs7QUFDM0IsaUJBQUssT0FBTDtBQUNBLGlCQUFLLFVBQUwsR0FBa0IsUUFBbEI7O0FBRUEsZ0JBQUksS0FBSyxZQUFULEVBQXVCO0FBQ25CLHFCQUFLLFlBQUwsQ0FBa0IsSUFBbEIsQ0FBdUIsS0FBSyxPQUE1QjtBQUNIOztBQUVELGdCQUFJLEtBQUssUUFBVCxFQUFtQjtBQUNmLG9CQUFJLE9BQU8sQ0FBWCxFQUFjO0FBQ1YseUJBQUssUUFBTCxDQUFjLElBQWQ7QUFDSCxpQkFGRCxNQUVPO0FBQ0gseUJBQUssUUFBTCxDQUFjLElBQWQ7QUFDQSx5QkFBSyxRQUFMLENBQWMsSUFBZCxVQUEwQixHQUExQjtBQUNBLHlCQUFLLFFBQUwsQ0FBYyxJQUFkLENBQW1CLFVBQW5CLEVBQStCLEdBQS9CO0FBQ0g7QUFDSjs7QUFFRCxnQkFBSSxXQUFXLEVBQWYsRUFDQTtBQUNJLDBCQUFVLE1BQVY7QUFDQSxxQkFBSyxlQUFMLEdBQXVCLElBQXZCO0FBQ0gsYUFKRCxNQU1BO0FBQ0kscUJBQUssZUFBTCxHQUF1QixLQUF2QjtBQUNIOztBQUVELGlCQUFLLFFBQUwsQ0FBYyxJQUFkLENBQW1CLE9BQW5CO0FBQ0EsaUJBQUssU0FBTCxDQUFlLEtBQUssS0FBcEI7O0FBRUEsZ0JBQUksS0FBSyxLQUFULEVBQWdCO0FBQ1oscUJBQUssS0FBTCxHQUFhLEtBQWI7QUFDSDtBQUNKOzs7MEJBakRjLEssRUFBTztBQUNsQixpQkFBSyxXQUFMLENBQWlCLFFBQVEsTUFBUixHQUFpQixNQUFsQztBQUNIOzs7MEJBRW1CLEssRUFBTztBQUN2QixpQkFBSyxRQUFMLENBQWMsV0FBZCxDQUEwQixLQUExQixFQUFpQyxLQUFqQztBQUNIOzs7Ozs7SUE4Q1EsZ0IsV0FBQSxnQjtBQUVULDhCQUFZLE9BQVosRUFBcUI7QUFBQTs7QUFDakIsYUFBSyxJQUFMLEdBQVksZ0JBQVo7QUFDQSxhQUFLLE9BQUwsR0FBZSxPQUFmO0FBQ0EsYUFBSyxJQUFMO0FBQ0g7Ozs7K0JBRU07QUFDSCxpQkFBSyxLQUFMO0FBQ0g7OztnQ0FFTztBQUNKLGlCQUFLLEtBQUwsR0FBYSxFQUFiO0FBQ0EsaUJBQUssTUFBTCxHQUFjLEVBQWQ7QUFDQSxpQkFBSyxPQUFMLENBQWEsSUFBYixDQUFrQixFQUFsQjtBQUNIOzs7K0JBRU8sSyxFQUFPLE8sRUFBUyxRLEVBQVUsRyxFQUFLOztBQUVuQyxnQkFBSSxDQUFDLEtBQUssS0FBTCxDQUFXLEtBQVgsQ0FBTCxFQUF3Qjs7QUFFcEIsb0JBQUksT0FBTyxJQUFJLFdBQUosQ0FBZ0IsS0FBaEIsRUFBdUIsS0FBSyxPQUE1QixDQUFYOztBQUVBLGlDQUFlLEtBQUssSUFBcEIsRUFBNEIsSUFBNUI7QUFDQSxxQkFBSyxLQUFMLENBQVcsS0FBWCxJQUFvQixJQUFwQjtBQUNIOztBQUVELGlCQUFLLEtBQUwsQ0FBVyxLQUFYLEVBQWtCLE1BQWxCLENBQXlCLE9BQXpCLEVBQWtDLFFBQWxDLEVBQTRDLEdBQTVDO0FBQ0g7Ozs4Q0FFc0IsSSxFQUFNOztBQUV6QixnQkFBSSxLQUFLLE1BQUwsQ0FBWSxNQUFaLElBQXNCLENBQTFCLEVBQ0E7QUFDSSxxQkFBSyxzQkFBTCxDQUE0QixJQUE1QjtBQUNBO0FBQ0g7O0FBRUQsZ0JBQUksUUFBUSxLQUFLLEtBQWpCOztBQUVBLGlCQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLEtBQWpCO0FBQ0EsaUJBQUssTUFBTCxDQUFZLElBQVo7O0FBRUEsZ0JBQUksSUFBSSxLQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLEtBQXBCLENBQVI7O0FBRUEsZ0JBQUksS0FBSyxDQUFULEVBQVc7QUFDUCxxQkFBSyxPQUFMLENBQWEsT0FBYixDQUFxQixLQUFLLEtBQTFCO0FBQ0E7QUFDSDs7QUFFRCxnQkFBSSxPQUFPLEtBQUssTUFBTCxDQUFZLElBQUksQ0FBaEIsQ0FBWDtBQUNBLGlCQUFLLEtBQUwsQ0FBVyxXQUFYLENBQXVCLEtBQUssS0FBTCxDQUFXLElBQVgsRUFBaUIsS0FBeEM7QUFDSDs7OytDQUV1QixJLEVBQU07QUFDMUIsaUJBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsS0FBSyxLQUF0QjtBQUNBLGlCQUFLLE9BQUwsQ0FBYSxNQUFiLENBQW9CLEtBQUssS0FBekI7QUFDSDs7Ozs7O0FBR0wsaUJBQWlCLFVBQWpCLEdBQThCLGdCQUE5QjtBQUNBLGlCQUFpQixXQUFqQixHQUErQixpQkFBL0I7O0lBRWEsTSxXQUFBLE07Ozs7Ozs7MEJBRUksSyxFQUFPO0FBQ2hCLGNBQUUsZ0JBQUYsRUFBb0IsSUFBcEIsQ0FBeUIsS0FBekI7QUFDSDs7OzBCQUVRLEssRUFBTztBQUNaLGNBQUUsY0FBRixFQUFrQixJQUFsQixDQUF1QixVQUFVLEtBQWpDO0FBQ0g7OzswQkFFUyxLLEVBQU87QUFDYixnQkFBSSxhQUFKO0FBQUEsZ0JBQVUsa0JBQVY7O0FBRUEsb0JBQVEsS0FBUjtBQUNJLHFCQUFLLG1CQUFXLEtBQVgsQ0FBaUIsR0FBdEI7QUFDSSwyQkFBTyxFQUFQO0FBQ0EsZ0NBQVksWUFBWjtBQUNBO0FBQ0oscUJBQUssbUJBQVcsS0FBWCxDQUFpQixVQUF0QjtBQUNJLDJCQUFPLGVBQVA7QUFDQSxnQ0FBWSxZQUFaO0FBQ0E7QUFDSixxQkFBSyxtQkFBVyxLQUFYLENBQWlCLFNBQXRCO0FBQ0ksMkJBQU8sV0FBUDtBQUNBLGdDQUFZLFdBQVo7QUFDQTtBQUNKLHFCQUFLLG1CQUFXLEtBQVgsQ0FBaUIsWUFBdEI7QUFDSSwyQkFBTyxpQkFBUDtBQUNBLGdDQUFZLFlBQVo7QUFDQTtBQUNKLHFCQUFLLG1CQUFXLEtBQVgsQ0FBaUIsS0FBdEI7QUFDSSwyQkFBTyxlQUFQO0FBQ0EsZ0NBQVksTUFBWjtBQUNBO0FBQ0o7QUFDSSwwQkFBTSxJQUFJLEtBQUosQ0FBVSwwQkFBVixDQUFOO0FBdEJSOztBQXlCQSxnQkFBSSxLQUFLLGlCQUFMLEdBQXlCLENBQTdCLEVBQWdDO0FBQzVCLCtCQUFhLEtBQUssaUJBQWxCO0FBQ0g7O0FBRUQsY0FBRSxlQUFGLEVBQW1CLFdBQW5CLEdBQWlDLFFBQWpDLENBQTBDLFNBQTFDO0FBQ0EsY0FBRSxvQkFBRixFQUF3QixJQUF4QixDQUE2QixJQUE3QjtBQUNIOzs7Ozs7SUFHUSxPLFdBQUEsTzs7O0FBRVQscUJBQWEsTUFBYixFQUFxQjtBQUFBOztBQUFBOztBQUdqQixlQUFLLE9BQUwsR0FBZSxNQUFmO0FBQ0EsZUFBSyxNQUFMLEdBQWMsT0FBTyxJQUFQLENBQVksUUFBWixDQUFkOztBQUVBLGVBQUssaUJBQUw7QUFDQSxlQUFLLGdCQUFMO0FBUGlCO0FBUXBCOzs7OzRDQUVvQjtBQUFBOztBQUNqQixnQkFBSSxZQUFZLEtBQWhCOztBQUVBLGlCQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLFVBQUMsQ0FBRCxFQUFPO0FBQ3JCLG9CQUFHLEVBQUUsS0FBRixLQUFZLEVBQWYsRUFBbUI7QUFBRTtBQUNqQiwyQkFBSyxNQUFMLENBQVksSUFBWjtBQUNIOztBQUVELG9CQUFJLEVBQUUsT0FBRixLQUFjLEVBQWxCLEVBQXNCO0FBQUU7QUFDcEIsZ0NBQVksSUFBWjtBQUNBLDJCQUFLLE1BQUwsQ0FBWSxJQUFaO0FBQ0g7QUFDSixhQVREOztBQVdBLGlCQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLFVBQUMsQ0FBRCxFQUFPO0FBQ3JCLDRCQUFZLEtBQVo7QUFDSCxhQUZEOztBQUlBLGlCQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLFVBQUMsQ0FBRCxFQUFPO0FBQ3BCLG9CQUFJLFNBQUosRUFBZTtBQUNYLDJCQUFLLFFBQUwsR0FEVyxDQUNNO0FBQ3BCLGlCQUZELE1BRU87QUFDSCwyQkFBSyxZQUFMO0FBQ0g7QUFDSixhQU5EO0FBT0g7Ozt1Q0FFZTtBQUNaLGdCQUFJLFdBQVcsS0FBSyxNQUFMLENBQVksR0FBWixFQUFmOztBQUVBLGdCQUFJLGFBQWEsS0FBSyxNQUF0QixFQUE4QjtBQUMxQjtBQUNIOztBQUVELGlCQUFLLE1BQUwsR0FBYyxRQUFkO0FBQ0EsaUJBQUssSUFBTCxDQUFVLE9BQVYsRUFBbUIsUUFBbkI7QUFDSDs7OzJDQUVtQjtBQUNoQjtBQUNBLGdCQUFJLFNBQVMsSUFBVCxLQUFrQixFQUF0QixFQUEwQjtBQUN0QixxQkFBSyxNQUFMLEdBQWMsU0FBUyxJQUFULENBQWMsTUFBZCxDQUFxQixDQUFyQixDQUFkO0FBQ0gsYUFGRCxNQUVPO0FBQ0gscUJBQUssTUFBTCxHQUFjLE9BQU8sWUFBUCxJQUF1QixJQUFyQztBQUNIOztBQUVELGlCQUFLLFFBQUw7QUFDSDs7O21DQUVXO0FBQ1IsaUJBQUssTUFBTCxDQUFZLEdBQVosQ0FBZ0IsS0FBSyxNQUFyQjtBQUNIOzs7NEJBRVk7QUFDVCxtQkFBTyxLQUFLLE1BQVo7QUFDSCxTOzBCQUVVLEssRUFBTztBQUNkLGlCQUFLLE1BQUwsR0FBYyxLQUFkO0FBQ0EsaUJBQUssUUFBTDtBQUNBLGlCQUFLLElBQUwsQ0FBVSxPQUFWLEVBQW1CLEtBQW5CO0FBQ0g7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDeFRMOzs7SUFHYSxZLFdBQUEsWTs7Ozs7Ozs7O0FBRVQ7OzsyQkFHSSxJLEVBQU0sRSxFQUFJO0FBQ1YsZ0JBQUksS0FBSyxRQUFRLElBQWIsTUFBdUIsU0FBM0IsRUFBc0M7QUFDbEMscUJBQUssUUFBUSxJQUFiLElBQXFCLEVBQXJCO0FBQ0g7O0FBRUQsaUJBQUssUUFBUSxJQUFiLEVBQW1CLElBQW5CLENBQXdCLEVBQXhCO0FBQ0g7O0FBRUQ7Ozs7Ozs7OzZCQUtNLEksRUFBZTtBQUFBOztBQUFBLDhDQUFOLElBQU07QUFBTixvQkFBTTtBQUFBOztBQUNqQixnQkFBSSxLQUFLLFFBQVEsSUFBYixDQUFKLEVBQXdCO0FBQ3BCLHFCQUFLLFFBQVEsSUFBYixFQUFtQixPQUFuQixDQUEyQixVQUFDLEVBQUQ7QUFBQSwyQkFBUSxHQUFHLEtBQUgsUUFBZSxJQUFmLENBQVI7QUFBQSxpQkFBM0I7QUFDSDtBQUNKOzs7Ozs7Ozs7QUN6Qkw7O0FBQ0E7O0FBRUE7O0FBRUEsSUFBSSxTQUFTLHVCQUFlLE9BQU8sTUFBUCxDQUFjLElBQTdCLEVBQW1DLE9BQU8sTUFBUCxDQUFjLElBQWpELEVBQXVELE9BQU8sTUFBUCxDQUFjLElBQXJFLEVBQTRFLE9BQU8sR0FBbkYsQ0FBYjtBQUNBLElBQUksV0FBVyx5QkFBcUIsRUFBRSxrQkFBRixDQUFyQixDQUFmO0FBQ0EsSUFBSSxTQUFTLGdCQUFiO0FBQ0EsSUFBSSxVQUFVLGdCQUFZLEVBQUUsU0FBRixDQUFaLENBQWQ7O0FBRUEsU0FBUyxJQUFULEdBQWdCLE9BQU8sZ0JBQVAsR0FBMEIscUJBQWlCLFVBQTNDLEdBQXdELHFCQUFpQixXQUF6Rjs7QUFFQSxPQUFPLFFBQVAsR0FBa0IsT0FBTyxRQUF6QjtBQUNBLE9BQU8sSUFBUCxHQUFjLE9BQU8sUUFBUCxFQUFkO0FBQ0EsT0FBTyxLQUFQLEdBQWUsQ0FBZjs7QUFFQSxTQUFTLElBQVQsR0FBZ0I7QUFDWixRQUFJLFFBQVEsUUFBUSxLQUFwQjs7QUFFQSxXQUFPLFNBQVAsQ0FBaUIsS0FBakIsRUFBd0IsWUFBWTtBQUNoQyxlQUFHLFFBQUgsQ0FBWSxLQUFaO0FBQ0EsaUJBQVMsSUFBVCxHQUFnQixNQUFNLEtBQXRCO0FBQ0gsS0FIRDs7QUFLQSxhQUFTLEtBQVQ7QUFDSDs7QUFFRCxRQUFRLEVBQVIsQ0FBVyxPQUFYLEVBQW9CLFlBQU07QUFDdEI7QUFDSCxDQUZEOztBQUlBLE9BQU8sV0FBUCxHQUFxQixZQUFNO0FBQ3ZCO0FBQ0EsV0FBRyxLQUFILENBQVMsdUJBQXVCLE9BQU8sUUFBUCxFQUFoQztBQUNILENBSEQ7O0FBS0EsT0FBTyxPQUFQLEdBQWlCLFVBQUMsV0FBRCxFQUFjLE9BQWQsRUFBMEI7QUFDdkMsV0FBRyxLQUFILENBQVMsV0FBVCxFQUFzQixPQUF0QixFQUErQixPQUEvQjtBQUNILENBRkQ7O0FBSUEsSUFBSSxvQkFBb0IsSUFBeEI7O0FBRUEsT0FBTyxjQUFQLEdBQXdCLFVBQUMsS0FBRCxFQUFXO0FBQy9CLFdBQU8saUJBQVAsR0FBMkIsT0FBTyxRQUFsQztBQUNBLFdBQU8sS0FBUCxHQUFlLEtBQWY7O0FBRUEsUUFBSSxDQUFDLFVBQVUsbUJBQVcsS0FBWCxDQUFpQixVQUEzQixJQUF5QyxVQUFVLG1CQUFXLEtBQVgsQ0FBaUIsWUFBckUsS0FBc0YsT0FBTyxRQUFQLElBQW1CLENBQTdHLEVBQWdIO0FBQzVHLFlBQUksTUFBTSxVQUFVLG1CQUFXLEtBQVgsQ0FBaUIsVUFBM0IsK0NBQ29DLE9BQU8sUUFEM0MsZ0VBRXNDLE9BQU8sUUFGN0MsZUFBVjs7QUFJQSxZQUFJLHNCQUFzQixJQUExQixFQUErQjtBQUMzQixnQ0FBb0IsT0FBRyxLQUFILENBQVMsR0FBVCxFQUFjLE9BQWQsRUFBdUIsSUFBdkIsQ0FBcEI7QUFDSCxTQUZELE1BRU87QUFDSCw4QkFBa0IsVUFBbEIsQ0FBNkIsR0FBN0I7QUFDSDtBQUNKOztBQUVELFFBQUksVUFBVSxtQkFBVyxLQUFYLENBQWlCLFNBQTNCLElBQXdDLHNCQUFzQixJQUFsRSxFQUF3RTtBQUNwRSwwQkFBa0IsSUFBbEI7QUFDQSw0QkFBb0IsSUFBcEI7O0FBRUEsWUFBSSxPQUFPLGVBQVAsSUFBMEIsS0FBOUIsRUFBcUM7QUFDakMsbUJBQUcsS0FBSCxDQUFTLGFBQVQ7QUFDSDtBQUNKO0FBQ0osQ0F4QkQ7O0FBMEJBLE9BQU8sU0FBUCxHQUFtQixVQUFDLEtBQUQsRUFBUSxHQUFSLEVBQWEsUUFBYixFQUF1QixHQUF2QixFQUErQjtBQUM5QyxhQUFTLE1BQVQsQ0FBZ0IsS0FBaEIsRUFBdUIsR0FBdkIsRUFBNEIsUUFBNUIsRUFBc0MsR0FBdEM7QUFDSCxDQUZEOztBQUlBLE9BQU8sT0FBUCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJleHBvcnQgY2xhc3MgV2FsbENsaWVudCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoaG9zdCwgcG9ydCwgcGF0aCwgcW9zID0gMCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucW9zID0gcW9zO1xyXG4gICAgICAgIHRoaXMuY2xpZW50SWQgPSBXYWxsQ2xpZW50LmdlbmVyYXRlQ2xpZW50SWQoKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBwYWhvIGRvY3VtZW50YXRpb246IGh0dHA6Ly93d3cuZWNsaXBzZS5vcmcvcGFoby9maWxlcy9qc2RvYy9pbmRleC5odG1sXHJcbiAgICAgICAgdGhpcy5jbGllbnQgPSBuZXcgUGFoby5NUVRULkNsaWVudChob3N0LCBwb3J0LCBwYXRoLCB0aGlzLmNsaWVudElkKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNsaWVudC5vbk1lc3NhZ2VBcnJpdmVkID0gKG1lc3NhZ2UpID0+IHtcclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIk1lc3NhZ2UgYXJyaXZlZCBcIiwgbWVzc2FnZSk7XHJcbiAgICAgICAgICAgIHRoaXMub25NZXNzYWdlKG1lc3NhZ2UuZGVzdGluYXRpb25OYW1lLCBtZXNzYWdlLnBheWxvYWRTdHJpbmcsIG1lc3NhZ2UucmV0YWluZWQsIG1lc3NhZ2UucW9zKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmNsaWVudC5vbkNvbm5lY3Rpb25Mb3N0ID0gKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIkNvbm5lY3Rpb24gbG9zdCBcIiwgZXJyb3IpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKFdhbGxDbGllbnQuaXNOZXR3b3JrRXJyb3IoZXJyb3IuZXJyb3JDb2RlKSl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZWNvbm5lY3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5vbkVycm9yKGBDb25uZWN0aW9uIGxvc3QgKCR7ZXJyb3IuZXJyb3JNZXNzYWdlfSlgLCB0cnVlKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRUb3BpYyA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMub25Db25uZWN0ZWQgPSAkLm5vb3AoKTtcclxuICAgICAgICB0aGlzLm9uTWVzc2FnZSA9ICQubm9vcCgpO1xyXG4gICAgICAgIHRoaXMub25FcnJvciA9ICQubm9vcCgpO1xyXG4gICAgICAgIHRoaXMub25TdGF0ZUNoYW5nZWQgPSAkLm5vb3AoKTtcclxuXHJcbiAgICAgICAgdGhpcy5maXJzdENvbm5lY3Rpb24gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuYXR0ZW1wdHMgPSAwO1xyXG4gICAgICAgIHRoaXMuX3NldFN0YXRlKFdhbGxDbGllbnQuU1RBVEUuTkVXKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2VuZXJhdGVDbGllbnRJZCgpIHtcclxuICAgICAgICB2YXIgdGltZSA9IERhdGUubm93KCkgJSAxMDAwO1xyXG4gICAgICAgIHZhciBybmQgPSBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxMDAwKTtcclxuICAgICAgICByZXR1cm4gYHdhbGwtJHt0aW1lKjEwMDAgKyBybmR9YDtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgaXNOZXR3b3JrRXJyb3IgKGNvZGUpIHtcclxuICAgICAgICAvLyBwb3NzaWJsZSBjb2RlczogaHR0cHM6Ly9naXRodWIuY29tL2VjbGlwc2UvcGFoby5tcXR0LmphdmFzY3JpcHQvYmxvYi9tYXN0ZXIvc3JjL21xdHR3czMxLmpzI0wxNjZcclxuICAgICAgICBjb25zdCBuZXR3b3JrRXJyb3JzID0gWyBcclxuICAgICAgICAgICAgMSAvKiBDT05ORUNUX1RJTUVPVVQgKi8sXHJcbiAgICAgICAgICAgIDIgLyogU1VCU0NSSUJFX1RJTUVPVVQgKi8sIFxyXG4gICAgICAgICAgICAzIC8qIFVOU1VCU0NSSUJFX1RJTUVPVVQgKi8sXHJcbiAgICAgICAgICAgIDQgLyogUElOR19USU1FT1VUICovLFxyXG4gICAgICAgICAgICA2IC8qIENPTk5BQ0tfUkVUVVJOQ09ERSAqLyxcclxuICAgICAgICAgICAgNyAvKiBTT0NLRVRfRVJST1IgKi8sXHJcbiAgICAgICAgICAgIDggLyogU09DS0VUX0NMT1NFICovLFxyXG4gICAgICAgICAgICA5IC8qIE1BTEZPUk1FRF9VVEYgKi8sXHJcbiAgICAgICAgICAgIDExIC8qIElOVkFMSURfU1RBVEUgKi8sXHJcbiAgICAgICAgICAgIDEyIC8qIElOVkFMSURfVFlQRSAqLyxcclxuICAgICAgICAgICAgMTUgLyogSU5WQUxJRF9TVE9SRURfREFUQSAqLyxcclxuICAgICAgICAgICAgMTYgLyogSU5WQUxJRF9NUVRUX01FU1NBR0VfVFlQRSAqLyxcclxuICAgICAgICAgICAgMTcgLyogTUFMRk9STUVEX1VOSUNPREUgKi8sXHJcbiAgICAgICAgXTtcclxuICAgICAgICByZXR1cm4gbmV0d29ya0Vycm9ycy5pbmRleE9mKGNvZGUpID49IDA7XHJcbiAgICB9XHJcblxyXG4gICAgc3Vic2NyaWJlICh0b3BpYywgZm4pIHtcclxuICAgIFxyXG4gICAgICAgIC8vIHVuc3Vic2NyaWJlIGN1cnJlbnQgdG9waWMgKGlmIGV4aXN0cylcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50VG9waWMgIT09IG51bGwgJiYgdGhpcy5jdXJyZW50VG9waWMgIT09IHRvcGljKSB7XHJcbiAgICAgICAgICAgIGxldCBvbGRUb3BpYyA9IHRoaXMuY3VycmVudFRvcGljO1xyXG4gICAgICAgICAgICB0aGlzLmNsaWVudC51bnN1YnNjcmliZShvbGRUb3BpYywge1xyXG4gICAgICAgICAgICAgICAgb25TdWNjZXNzOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiVW5zdWJzY3JpYmUgJyVzJyBzdWNjZXNzXCIsIG9sZFRvcGljKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbkZhaWx1cmU6IChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJVbnN1YnNjcmliZSAnJXMnIGZhaWx1cmVcIiwgb2xkVG9waWMsIGVycm9yKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgLy8gc3Vic2NyaWJlIG5ldyB0b3BpY1xyXG4gICAgICAgIHRoaXMuY2xpZW50LnN1YnNjcmliZSh0b3BpYywge1xyXG4gICAgICAgICAgICBxb3M6IHRoaXMucW9zLFxyXG4gICAgICAgICAgICBvblN1Y2Nlc3M6IChyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXCJTdWJzY3JpYmUgJyVzJyBzdWNjZXNzXCIsIHRvcGljLCByKTtcclxuICAgICAgICAgICAgICAgIGlmIChmbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uRmFpbHVyZTogKHIpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJzdWJzY3JpYmUgJyVzJyBmYWlsdXJlXCIsIHRvcGljLCByKTtcclxuICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcihcIlN1YnNjcmliZSBmYWlsdXJlXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudFRvcGljID0gdG9waWM7XHJcbiAgICB9XHJcblxyXG4gICAgY29ubmVjdCAoKSB7XHJcblxyXG4gICAgICAgIGxldCBjb25uZWN0T3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIG9uU3VjY2VzcyA6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIkNvbm5lY3Qgc3VjY2Vzc1wiKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5hdHRlbXB0cyA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRTdGF0ZShXYWxsQ2xpZW50LlNUQVRFLkNPTk5FQ1RFRCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZpcnN0Q29ubmVjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmlyc3RDb25uZWN0aW9uID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkNvbm5lY3RlZCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN1YnNjcmliZSh0aGlzLmN1cnJlbnRUb3BpYyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBvbkZhaWx1cmUgOiAoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJDb25uZWN0IGZhaWwgXCIsIGVycm9yKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKFdhbGxDbGllbnQuaXNOZXR3b3JrRXJyb3IoZXJyb3IuZXJyb3JDb2RlKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVjb25uZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoXCJGYWlsIHRvIGNvbm5lY3RcIiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLl9zZXRTdGF0ZSh0aGlzLmZpcnN0Q29ubmVjdGlvbiA/IFdhbGxDbGllbnQuU1RBVEUuQ09OTkVDVElORyA6IFdhbGxDbGllbnQuU1RBVEUuUkVDT05ORUNUSU5HKVxyXG5cclxuICAgICAgICB0aGlzLmNsaWVudC5jb25uZWN0KGNvbm5lY3RPcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBfcmVjb25uZWN0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5hdHRlbXB0cyArKztcclxuICAgICAgICB0aGlzLl9zZXRTdGF0ZSh0aGlzLmZpcnN0Q29ubmVjdGlvbiA/IFdhbGxDbGllbnQuU1RBVEUuQ09OTkVDVElORyA6IFdhbGxDbGllbnQuU1RBVEUuUkVDT05ORUNUSU5HKTtcclxuXHJcbiAgICAgICAgbGV0IHQgPSAodGhpcy5hdHRlbXB0cy0xKSAqIDIwMDA7XHJcbiAgICAgICAgdCA9IE1hdGgubWF4KE1hdGgubWluKHQsIDMwMDAwKSwgMTAwKTtcclxuXHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdCgpO1xyXG4gICAgICAgIH0sIHQpO1xyXG4gICAgfVxyXG5cclxuICAgIF9zZXRTdGF0ZSAoc3RhdGUpIHtcclxuICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGU7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm9uU3RhdGVDaGFuZ2VkKVxyXG4gICAgICAgICAgICB0aGlzLm9uU3RhdGVDaGFuZ2VkKHN0YXRlKTtcclxuICAgIH1cclxuXHJcbiAgICB0b1N0cmluZyAoKSB7XHJcbiAgICAgICAgbGV0IHN0ciA9IHRoaXMuY2xpZW50Lmhvc3Q7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNsaWVudC5wb3J0ICE9IDgwKSB7XHJcbiAgICAgICAgICAgIHN0ciArPSBcIjpcIiArIHRoaXMuY2xpZW50LnBvcnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jbGllbnQucGF0aCAhPSBcIlwiKSB7XHJcbiAgICAgICAgICAgIHN0ciArPSBcIlwiICsgdGhpcy5jbGllbnQucGF0aDtcclxuICAgICAgICB9IFxyXG5cclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgfVxyXG59XHJcblxyXG5XYWxsQ2xpZW50LlNUQVRFID0ge1xyXG4gICAgTkVXOiAwLFxyXG4gICAgQ09OTkVDVElORzogMSxcclxuICAgIENPTk5FQ1RFRDogMixcclxuICAgIFJFQ09OTkVDVElORzogMyxcclxuICAgIEVSUk9SOiA5OVxyXG59O1xyXG4iLCJpbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnLi91dGlscy5qcyc7XHJcbmltcG9ydCB7V2FsbENsaWVudH0gZnJvbSAnLi9jbGllbnQuanMnO1xyXG5cclxuZXhwb3J0IHZhciBVSSA9IHt9O1xyXG5cclxuVUkuc2V0VGl0bGUgPSBmdW5jdGlvbiAodG9waWMpIHtcclxuICAgIGRvY3VtZW50LnRpdGxlID0gXCJNUVRUIFdhbGxcIiArICh0b3BpYyA/IChcIiBmb3IgXCIgKyB0b3BpYykgOiBcIlwiKTtcclxufTtcclxuIFxyXG5VSS50b2FzdCA9IGZ1bmN0aW9uIChtZXNzYWdlLCB0eXBlID0gXCJpbmZvXCIsIHBlcnNpc3RlbnQgPSBmYWxzZSkge1xyXG4gICAgcmV0dXJuIG5ldyBUb2FzdChtZXNzYWdlLCB0eXBlLCBwZXJzaXN0ZW50KTtcclxufTtcclxuXHJcbmNsYXNzIFRvYXN0IHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciAobWVzc2FnZSwgdHlwZSA9IFwiaW5mb1wiLCBwZXJzaXN0ZW50ID0gZmFsc2UpIHtcclxuXHJcbiAgICAgICAgdGhpcy4kcm9vdCA9ICQoXCI8ZGl2IGNsYXNzPSd0b2FzdC1pdGVtJz5cIilcclxuICAgICAgICAgICAgLnRleHQobWVzc2FnZSlcclxuICAgICAgICAgICAgLmFkZENsYXNzKHR5cGUpXHJcbiAgICAgICAgICAgIC5oaWRlKClcclxuICAgICAgICAgICAgLmFwcGVuZFRvKFwiI3RvYXN0XCIpXHJcbiAgICAgICAgICAgIC5mYWRlSW4oKTtcclxuXHJcbiAgICAgICAgaWYgKHBlcnNpc3RlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy4kcm9vdC5hZGRDbGFzcyhcInBlcnNpc3RlbnRcIik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7IHRoaXMuaGlkZSgpOyB9LCA1MDAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZSAoKSB7XHJcbiAgICAgICAgdGhpcy4kcm9vdC5zbGlkZVVwKCkucXVldWUoKCkgPT4geyB0aGlzLnJlbW92ZSgpOyB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmUgKCkge1xyXG4gICAgICAgIHRoaXMuJHJvb3QucmVtb3ZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWVzc2FnZSAobWVzc2FnZSkge1xyXG4gICAgICAgIHRoaXMuJHJvb3QudGV4dChtZXNzYWdlKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIE1lc3NhZ2VMaW5lIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih0b3BpYyl7XHJcbiAgICAgICAgdGhpcy50b3BpYyA9IHRvcGljO1xyXG4gICAgICAgIHRoaXMuY291bnRlciA9IDA7XHJcbiAgICAgICAgdGhpcy5pc05ldyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICB0aGlzLiRyb290ID0gJChcIjxhcnRpY2xlIGNsYXNzPSdtZXNzYWdlJz5cIik7XHJcblxyXG4gICAgICAgIHZhciBoZWFkZXIgPSAkKFwiPGhlYWRlcj5cIikuYXBwZW5kVG8odGhpcy4kcm9vdCk7XHJcblxyXG4gICAgICAgICQoXCI8aDI+XCIpXHJcbiAgICAgICAgICAgIC50ZXh0KHRoaXMudG9waWMpXHJcbiAgICAgICAgICAgIC5hcHBlbmRUbyhoZWFkZXIpO1xyXG5cclxuICAgICAgICBpZiAod2luZG93LmNvbmZpZy5zaG93Q291bnRlcikge1xyXG4gICAgICAgICAgICB0aGlzLiRjb3VudGVyTWFyayA9ICQoXCI8c3BhbiBjbGFzcz0nbWFyayBjb3VudGVyJyB0aXRsZT0nTWVzc2FnZSBjb3VudGVyJz4wPC9zcGFuPlwiKVxyXG4gICAgICAgICAgICAgICAgLmFwcGVuZFRvKGhlYWRlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLiRyZXRhaW5NYXJrID0gJChcIjxzcGFuIGNsYXNzPSdtYXJrIHJldGFpbicgdGl0bGU9J1JldGFpbiBtZXNzYWdlJz5SPC9zcGFuPlwiKVxyXG4gICAgICAgICAgICAuYXBwZW5kVG8oaGVhZGVyKTtcclxuXHJcbiAgICAgICAgdGhpcy4kcW9zTWFyayA9ICQoXCI8c3BhbiBjbGFzcz0nbWFyayBxb3MnIHRpdGxlPSdSZWNlaXZlZCBtZXNzYWdlIFFvUyc+UW9TPC9zcGFuPlwiKVxyXG4gICAgICAgICAgICAuYXBwZW5kVG8oaGVhZGVyKTtcclxuXHJcbiAgICAgICAgdGhpcy4kcGF5bG9hZCA9ICQoXCI8cD5cIikuYXBwZW5kVG8odGhpcy4kcm9vdCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGlzUmV0YWluZWQodmFsdWUpIHtcclxuICAgICAgICB0aGlzLiRyZXRhaW5NYXJrW3ZhbHVlID8gJ3Nob3cnIDogJ2hpZGUnXSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBpc1N5c3RlbVBheWxvYWQodmFsdWUpIHtcclxuICAgICAgICB0aGlzLiRwYXlsb2FkLnRvZ2dsZUNsYXNzKFwic3lzXCIsIHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBoaWdobGlnaHQobGluZSA9IGZhbHNlKSB7XHJcbiAgICAgICAgKGxpbmUgPyB0aGlzLiRyb290IDogdGhpcy4kcGF5bG9hZClcclxuICAgICAgICAgICAgLnN0b3AoKVxyXG4gICAgICAgICAgICAuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6IFwiIzBDQjBGRlwifSlcclxuICAgICAgICAgICAgLmFuaW1hdGUoe2JhY2tncm91bmRDb2xvcjogXCIjZmZmXCJ9LCAyMDAwKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUocGF5bG9hZCwgcmV0YWluZWQsIHFvcykge1xyXG4gICAgICAgIHRoaXMuY291bnRlciArKztcclxuICAgICAgICB0aGlzLmlzUmV0YWluZWQgPSByZXRhaW5lZDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuJGNvdW50ZXJNYXJrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGNvdW50ZXJNYXJrLnRleHQodGhpcy5jb3VudGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuJHFvc01hcmspIHtcclxuICAgICAgICAgICAgaWYgKHFvcyA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRxb3NNYXJrLmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHFvc01hcmsuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kcW9zTWFyay50ZXh0KGBRb1MgJHtxb3N9YCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRxb3NNYXJrLmF0dHIoXCJkYXRhLXFvc1wiLCBxb3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGF5bG9hZCA9PSBcIlwiKSBcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHBheWxvYWQgPSBcIk5VTExcIjtcclxuICAgICAgICAgICAgdGhpcy5pc1N5c3RlbVBheWxvYWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmlzU3lzdGVtUGF5bG9hZCA9IGZhbHNlOyAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuJHBheWxvYWQudGV4dChwYXlsb2FkKTtcclxuICAgICAgICB0aGlzLmhpZ2hsaWdodCh0aGlzLmlzTmV3KTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNOZXcpIHtcclxuICAgICAgICAgICAgdGhpcy5pc05ldyA9IGZhbHNlO1xyXG4gICAgICAgIH0gICAgICAgXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBNZXNzYWdlQ29udGFpbmVyIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigkcGFyZW50KSB7XHJcbiAgICAgICAgdGhpcy5zb3J0ID0gJ0FscGhhYmV0aWNhbGx5JztcclxuICAgICAgICB0aGlzLiRwYXJlbnQgPSAkcGFyZW50O1xyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0KCkge1xyXG4gICAgICAgIHRoaXMubGluZXMgPSB7fTtcclxuICAgICAgICB0aGlzLnRvcGljcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuJHBhcmVudC5odG1sKFwiXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSAodG9waWMsIHBheWxvYWQsIHJldGFpbmVkLCBxb3MpIHtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmxpbmVzW3RvcGljXSkge1xyXG5cclxuICAgICAgICAgICAgdmFyIGxpbmUgPSBuZXcgTWVzc2FnZUxpbmUodG9waWMsIHRoaXMuJHBhcmVudCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzW2BhZGRMaW5lJHt0aGlzLnNvcnR9YF0obGluZSk7XHJcbiAgICAgICAgICAgIHRoaXMubGluZXNbdG9waWNdID0gbGluZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubGluZXNbdG9waWNdLnVwZGF0ZShwYXlsb2FkLCByZXRhaW5lZCwgcW9zKTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRMaW5lQWxwaGFiZXRpY2FsbHkgKGxpbmUpIHtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMudG9waWNzLmxlbmd0aCA9PSAwKSBcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkTGluZUNocm9ub2xvZ2ljYWxseShsaW5lKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHRvcGljID0gbGluZS50b3BpYztcclxuXHJcbiAgICAgICAgdGhpcy50b3BpY3MucHVzaCh0b3BpYyk7XHJcbiAgICAgICAgdGhpcy50b3BpY3Muc29ydCgpO1xyXG5cclxuICAgICAgICB2YXIgbiA9IHRoaXMudG9waWNzLmluZGV4T2YodG9waWMpO1xyXG5cclxuICAgICAgICBpZiAobiA9PSAwKXtcclxuICAgICAgICAgICAgdGhpcy4kcGFyZW50LnByZXBlbmQobGluZS4kcm9vdCk7XHJcbiAgICAgICAgICAgIHJldHVybjsgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgcHJldiA9IHRoaXMudG9waWNzW24gLSAxXTtcclxuICAgICAgICBsaW5lLiRyb290Lmluc2VydEFmdGVyKHRoaXMubGluZXNbcHJldl0uJHJvb3QpO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZExpbmVDaHJvbm9sb2dpY2FsbHkgKGxpbmUpIHtcclxuICAgICAgICB0aGlzLnRvcGljcy5wdXNoKGxpbmUudG9waWMpO1xyXG4gICAgICAgIHRoaXMuJHBhcmVudC5hcHBlbmQobGluZS4kcm9vdCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbk1lc3NhZ2VDb250YWluZXIuU09SVF9BUExIQSA9IFwiQWxwaGFiZXRpY2FsbHlcIjtcclxuTWVzc2FnZUNvbnRhaW5lci5TT1JUX0NIUk9OTyA9IFwiQ2hyb25vbG9naWNhbGx5XCI7XHJcblxyXG5leHBvcnQgY2xhc3MgRm9vdGVyIHtcclxuXHJcbiAgICBzZXQgY2xpZW50SWQodmFsdWUpIHtcclxuICAgICAgICAkKFwiI3N0YXR1cy1jbGllbnRcIikudGV4dCh2YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGhvc3QodmFsdWUpIHtcclxuICAgICAgICAkKFwiI3N0YXR1cy1ob3N0XCIpLnRleHQoXCJ3czovL1wiICsgdmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBzdGF0ZSh2YWx1ZSkge1xyXG4gICAgICAgIGxldCB0ZXh0LCBjbGFzc05hbWU7XHJcblxyXG4gICAgICAgIHN3aXRjaCAodmFsdWUpIHtcclxuICAgICAgICAgICAgY2FzZSBXYWxsQ2xpZW50LlNUQVRFLk5FVzpcclxuICAgICAgICAgICAgICAgIHRleHQgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gXCJjb25uZWN0aW5nXCI7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBXYWxsQ2xpZW50LlNUQVRFLkNPTk5FQ1RJTkc6XHJcbiAgICAgICAgICAgICAgICB0ZXh0ID0gXCJjb25uZWN0aW5nLi4uXCI7XHJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSBcImNvbm5lY3RpbmdcIjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFdhbGxDbGllbnQuU1RBVEUuQ09OTkVDVEVEOlxyXG4gICAgICAgICAgICAgICAgdGV4dCA9IFwiY29ubmVjdGVkXCI7XHJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSBcImNvbm5lY3RlZFwiO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgV2FsbENsaWVudC5TVEFURS5SRUNPTk5FQ1RJTkc6XHJcbiAgICAgICAgICAgICAgICB0ZXh0ID0gXCJyZWNvbm5lY3RpbmcuLi5cIjtcclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IFwiY29ubmVjdGluZ1wiO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgV2FsbENsaWVudC5TVEFURS5FUlJPUjpcclxuICAgICAgICAgICAgICAgIHRleHQgPSBcIm5vdCBjb25uZWN0ZWRcIjtcclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IFwiZmFpbFwiO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIFdhbGxDbGllbnQuU1RBVEVcIilcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnJlY29ubmVjdEF0dGVtcHRzID4gMSkge1xyXG4gICAgICAgICAgICB0ZXh0ICs9IGAgKCR7dGhpcy5yZWNvbm5lY3RBdHRlbXB0c30pYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICQoXCIjc3RhdHVzLXN0YXRlXCIpLnJlbW92ZUNsYXNzKCkuYWRkQ2xhc3MoY2xhc3NOYW1lKTtcclxuICAgICAgICAkKFwiI3N0YXR1cy1zdGF0ZSBzcGFuXCIpLnRleHQodGV4dCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBUb29sYmFyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciAocGFyZW50KSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLiRwYXJlbnQgPSBwYXJlbnQ7XHJcbiAgICAgICAgdGhpcy4kdG9waWMgPSBwYXJlbnQuZmluZChcIiN0b3BpY1wiKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmluaXRFdmVudEhhbmRsZXJzKCk7XHJcbiAgICAgICAgdGhpcy5pbml0RGVmYXVsdFRvcGljKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdEV2ZW50SGFuZGxlcnMgKCkge1xyXG4gICAgICAgIGxldCBpbmhpYml0b3IgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy4kdG9waWMua2V5dXAoKGUpID0+IHtcclxuICAgICAgICAgICAgaWYoZS53aGljaCA9PT0gMTMpIHsgLy8gRU5URVJcclxuICAgICAgICAgICAgICAgIHRoaXMuJHRvcGljLmJsdXIoKTtcclxuICAgICAgICAgICAgfSAgXHJcblxyXG4gICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAyNykgeyAvLyBFU0NcclxuICAgICAgICAgICAgICAgIGluaGliaXRvciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiR0b3BpYy5ibHVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy4kdG9waWMuZm9jdXMoKGUpID0+IHtcclxuICAgICAgICAgICAgaW5oaWJpdG9yID0gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuJHRvcGljLmJsdXIoKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGluaGliaXRvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVVaSgpOyAvLyByZXZlcnQgY2hhbmdlc1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbnB1dENoYW5nZWQoKTtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpbnB1dENoYW5nZWQgKCkge1xyXG4gICAgICAgIHZhciBuZXdUb3BpYyA9IHRoaXMuJHRvcGljLnZhbCgpOyBcclxuXHJcbiAgICAgICAgaWYgKG5ld1RvcGljID09PSB0aGlzLl90b3BpYykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl90b3BpYyA9IG5ld1RvcGljO1xyXG4gICAgICAgIHRoaXMuZW1pdChcInRvcGljXCIsIG5ld1RvcGljKTtcclxuICAgIH0gXHJcblxyXG4gICAgaW5pdERlZmF1bHRUb3BpYyAoKSB7XHJcbiAgICAgICAgLy8gVVJMIGhhc2ggXHJcbiAgICAgICAgaWYgKGxvY2F0aW9uLmhhc2ggIT09IFwiXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5fdG9waWMgPSBsb2NhdGlvbi5oYXNoLnN1YnN0cigxKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl90b3BpYyA9IGNvbmZpZy5kZWZhdWx0VG9waWMgfHwgXCIvI1wiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGVVaSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVVpICgpIHtcclxuICAgICAgICB0aGlzLiR0b3BpYy52YWwodGhpcy5fdG9waWMpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCB0b3BpYyAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RvcGljO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCB0b3BpYyAodmFsdWUpIHtcclxuICAgICAgICB0aGlzLl90b3BpYyA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVWkoKTtcclxuICAgICAgICB0aGlzLmVtaXQoXCJ0b3BpY1wiLCB2YWx1ZSk7XHJcbiAgICB9XHJcbn0iLCIvKipcclxuICogU2ltcGxlIHZlcnNpb24gb2Ygbm9kZS5qcydzIEV2ZW50RW1pdGVyIGNsYXNzXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRXZlbnRFbWl0dGVyIHtcclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgZXZlbnQgaGFuZGxlciBvZiBnaXZlbnQgdHlwZVxyXG4gICAgICovXHJcbiAgICBvbiAodHlwZSwgZm4pIHtcclxuICAgICAgICBpZiAodGhpc1snX29uJyArIHR5cGVdID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpc1snX29uJyArIHR5cGVdID0gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzWydfb24nICsgdHlwZV0ucHVzaChmbik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFbWl0IGV2ZW50IG9mIHR5cGUuXHJcbiAgICAgKiBcclxuICAgICAqIEFsbCBhcmd1bWVudHMgd2lsbCBiZSBhcHBsYXkgdG8gY2FsbGJhY2ssIHByZXNlcnZlIGNvbnRleHQgb2Ygb2JqZWN0IHRoaXMuXHJcbiAgICAgKi9cclxuICAgIGVtaXQgKHR5cGUsIC4uLmFyZ3MpIHtcclxuICAgICAgICBpZiAodGhpc1snX29uJyArIHR5cGVdKSB7XHJcbiAgICAgICAgICAgIHRoaXNbJ19vbicgKyB0eXBlXS5mb3JFYWNoKChmbikgPT4gZm4uYXBwbHkodGhpcywgYXJncykpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSBcclxuIiwiaW1wb3J0IHtXYWxsQ2xpZW50fSBmcm9tICcuL2NsaWVudC5qcyc7XHJcbmltcG9ydCB7VUksIE1lc3NhZ2VMaW5lLCBNZXNzYWdlQ29udGFpbmVyLCBGb290ZXIsIFRvb2xiYXJ9IGZyb20gXCIuL3VpLmpzXCI7XHJcblxyXG4vLyAtLS0gTWFpbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG52YXIgY2xpZW50ID0gbmV3IFdhbGxDbGllbnQoY29uZmlnLnNlcnZlci5ob3N0LCBjb25maWcuc2VydmVyLnBvcnQsIGNvbmZpZy5zZXJ2ZXIucGF0aCwgIGNvbmZpZy5xb3MpO1xyXG52YXIgbWVzc2FnZXMgPSBuZXcgTWVzc2FnZUNvbnRhaW5lcigkKFwic2VjdGlvbi5tZXNzYWdlc1wiKSk7XHJcbnZhciBmb290ZXIgPSBuZXcgRm9vdGVyKCk7XHJcbnZhciB0b29sYmFyID0gbmV3IFRvb2xiYXIoJChcIiNoZWFkZXJcIikpO1xyXG5cclxubWVzc2FnZXMuc29ydCA9IGNvbmZpZy5hbHBoYWJldGljYWxTb3J0ID8gTWVzc2FnZUNvbnRhaW5lci5TT1JUX0FQTEhBIDogTWVzc2FnZUNvbnRhaW5lci5TT1JUX0NIUk9OTztcclxuXHJcbmZvb3Rlci5jbGllbnRJZCA9IGNsaWVudC5jbGllbnRJZDtcclxuZm9vdGVyLmhvc3QgPSBjbGllbnQudG9TdHJpbmcoKTtcclxuZm9vdGVyLnN0YXRlID0gMDtcclxuXHJcbmZ1bmN0aW9uIGxvYWQoKSB7XHJcbiAgICBsZXQgdG9waWMgPSB0b29sYmFyLnRvcGljO1xyXG5cclxuICAgIGNsaWVudC5zdWJzY3JpYmUodG9waWMsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBVSS5zZXRUaXRsZSh0b3BpYyk7XHJcbiAgICAgICAgbG9jYXRpb24uaGFzaCA9IFwiI1wiICsgdG9waWM7XHJcbiAgICB9KTtcclxuXHJcbiAgICBtZXNzYWdlcy5yZXNldCgpO1xyXG59XHJcblxyXG50b29sYmFyLm9uKFwidG9waWNcIiwgKCkgPT4ge1xyXG4gICAgbG9hZCgpO1xyXG59KTtcclxuXHJcbmNsaWVudC5vbkNvbm5lY3RlZCA9ICgpID0+IHtcclxuICAgIGxvYWQoKTtcclxuICAgIFVJLnRvYXN0KFwiQ29ubmVjdGVkIHRvIGhvc3QgXCIgKyBjbGllbnQudG9TdHJpbmcoKSk7XHJcbn07XHJcblxyXG5jbGllbnQub25FcnJvciA9IChkZXNjcmlwdGlvbiwgaXNGYXRhbCkgPT4ge1xyXG4gICAgVUkudG9hc3QoZGVzY3JpcHRpb24sIFwiZXJyb3JcIiwgaXNGYXRhbCk7XHJcbn07XHJcblxyXG5sZXQgcmVjb25uZWN0aW5nVG9hc3QgPSBudWxsO1xyXG5cclxuY2xpZW50Lm9uU3RhdGVDaGFuZ2VkID0gKHN0YXRlKSA9PiB7XHJcbiAgICBmb290ZXIucmVjb25uZWN0QXR0ZW1wdHMgPSBjbGllbnQuYXR0ZW1wdHM7XHJcbiAgICBmb290ZXIuc3RhdGUgPSBzdGF0ZTtcclxuXHJcbiAgICBpZiAoKHN0YXRlID09PSBXYWxsQ2xpZW50LlNUQVRFLkNPTk5FQ1RJTkcgfHwgc3RhdGUgPT09IFdhbGxDbGllbnQuU1RBVEUuUkVDT05ORUNUSU5HKSAmJiBjbGllbnQuYXR0ZW1wdHMgPj0gMikge1xyXG4gICAgICAgIHZhciBtc2cgPSBzdGF0ZSA9PT0gV2FsbENsaWVudC5TVEFURS5DT05ORUNUSU5HID9cclxuICAgICAgICAgICAgYEZhaWwgdG8gY29ubmVjdC4gVHJ5aW5nIHRvIGNvbm5lY3QuLi4gKCR7Y2xpZW50LmF0dGVtcHRzfSBhdHRlbXB0cylgOlxyXG4gICAgICAgICAgICBgQ29ubmVjdGlvbiBsb3N0LiBUcnlpbmcgdG8gcmVjb25uZWN0Li4uICgke2NsaWVudC5hdHRlbXB0c30gYXR0ZW1wdHMpYDtcclxuXHJcbiAgICAgICAgaWYgKHJlY29ubmVjdGluZ1RvYXN0ID09PSBudWxsKXtcclxuICAgICAgICAgICAgcmVjb25uZWN0aW5nVG9hc3QgPSBVSS50b2FzdChtc2csIFwiZXJyb3JcIiwgdHJ1ZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVjb25uZWN0aW5nVG9hc3Quc2V0TWVzc2FnZShtc2cpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoc3RhdGUgPT09IFdhbGxDbGllbnQuU1RBVEUuQ09OTkVDVEVEICYmIHJlY29ubmVjdGluZ1RvYXN0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgcmVjb25uZWN0aW5nVG9hc3QuaGlkZSgpO1xyXG4gICAgICAgIHJlY29ubmVjdGluZ1RvYXN0ID0gbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKGNsaWVudC5maXJzdENvbm5lY3Rpb24gPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgVUkudG9hc3QoXCJSZWNvbm5lY3RlZFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsaWVudC5vbk1lc3NhZ2UgPSAodG9waWMsIG1zZywgcmV0YWluZWQsIHFvcykgPT4ge1xyXG4gICAgbWVzc2FnZXMudXBkYXRlKHRvcGljLCBtc2csIHJldGFpbmVkLCBxb3MpO1xyXG59O1xyXG5cclxuY2xpZW50LmNvbm5lY3QoKTtcclxuIl19

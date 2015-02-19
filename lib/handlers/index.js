'use strict'

// Event orchestrator
module.exports.handlers = {};

module.exports.handlers.eventHandler = require('./eventHandler');

// Callback Handlers
var callbacks = require('./callbacks');

module.exports.handlers.callbacks = {};

Object.keys(callbacks).forEach(function (k) {
    module.exports.handlers.callbacks[k] = callbacks[k];
});
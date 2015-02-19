'use strict'

/**
 * The event handler is responsible to delegating to transport specific event handler.
 * Each event handled by this event handler has a transport designation: HTTP, SQS, SMS,
 * SMTP. This event handler uses that designation to delegate the handling of the even
 * to a transport specific handler. Each transport handler is responsible for delivering
 * the event payload (if any) to the target callback
 *
 * The following object represents an event that would trigger a callback. The entity is
 * dynamic and will represent the entity associated with the callback:
 *
 * {
 *    "Message": {
 *        "eventName": "Marco",,
 *        "userId": "6EF6C1E9-E130-2427-8641E1A2E3DA4C8D",
 *        "accountId": "337635823HFOP",
 *        "hostname": "simon",
 *        "entity": {
 *            "marco": "polo",
 *            "details": {
 *                "calledBackFrom": "phoenix"
 *            }
 *        }
 *    }
 * }
 *
 * The following object is an example of a registered web hook. Web hooks are created by
 * users who want us to call back to an external endpoint when some event occurs. I this
 * case the "Marco" event. This event handler will retrieve an web hooks that have an
 * eventBinding that match the eventName of the triggering event. So the eventName above,
 * "Marco" resulted in us retrieving the registered web hook below because of it's
 * eventBinding, "Marco"
 *
 * NOTE: The body of the web hook will be sent as an escaped string to avoid invalid jason.
 *
 * {
 *   "id": "541b194744ae103792fd9903",
 *   "accountId": "337635823HFOP",
 *   "eventBinding": "Marco",
 *   "transport": "http",
 *   "transportProperties": {
 *       "endpoint": "https://mediasilo.slack.com/services/hooks/incoming-webhook?token=mRxnu8TL3rxWHKK0XdxCMvCh"
 *  },
 *   "body": "{\"text\": \"<%marco%>\"}",
 *   "createdBy": "6EF6C1E9-E130-2427-8641E1A2E3DA4C8D",
 *   "created": 1411062087165
 * }
 *
 */

// Local deps
var callbacks = require('./callbacks');
// We support custom payload templates to be defined in our web hooks.
// Mustache helps us compile the templates.
var mustache  = require('mustache');
// Because many of the payloads we're handling are JSON we want to stay away
// from the troublesome double mustache delimiter that mustache.js uses
mustache.tags = ['<%', '%>'];

// Package deps
var requestify = require('requestify');
var bunyan     = require('bunyan');


module.exports = function(args) {

    // Initialize the logger. If we don't have a logger we'll instantiate a new one
    var logger = args.logger ? args.logger : bunyan.createLogger({name: "birdcall"});
    logger.debug("Event handler called");
    var event = JSON.parse(args.event);
    logger.debug("Event:", event);
    // This is the Phoenix URL where we can retrieve webhook for the given event and account
    var requestUrl = "http://b-api.mediasilo.com/v3/webhooks?accountId="+event.accountId+"&eventBinding="+event.eventName;
    logger.debug("Request URL: ", requestUrl);
    requestify.get(requestUrl)
        .then(function(response) {
            logger.debug("Response from getting webhooks: ", response);

            // There may be several webhooks. We'll need to phone home for all of them
            var webhooks = response.getBody();

            if(webhooks.length == 0) {
                logger.debug("No webhooks");
                args.success();
                return;
            }
            // We call the handlers by matching the prefix of the handler name to
            // the transport type in the webhook. So, to create a new handler you
            // just need to create a file named <TRANSPORT>Handler and it will get
            // called below
            webhooks.forEach(function(webhook, index, array) {
                Object.keys(callbacks).forEach(function (k) {
                    var handlerType = k.replace('Handler', '').toLowerCase();
                    if(handlerType === webhook.transport) {
                        var body = args.event;
                        if(webhook.body) {
                            body = mustache.render(webhook.body, JSON.parse(args.event));
                        }

                        callbacks[k]({
                            event: event,
                            webhook: webhook,
                            body: body,
                            success: args.success,
                            error: args.error
                        });
                    }
                });

            });
        },
        function(response) {
            logger.error("Error getting web hooks:", response);
        }
    );




}
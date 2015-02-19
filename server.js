'use strict'

/**
 * The purpose of this server is to poll for and invoke callbacks as a result of
 * events in Phoenix, MediaSilo's API. It reads messages from a queue that represent
 * API events. in response to those events this app will check for any callbacks
 * registered for the scope of the event and call back to them. In short, it's a web
 * hook runner.
 *
 * In order for this server to run the following env vars need to be configured:
 *
 * env AWS_ACCESS_KEY_ID=<YOUR ACCESS KEY>
 * env AWS_SECRET_ACCESS_KEY=<YOUR SECRET>
 * env AWS_REGION=<THE REGION OF YOUR SQS Q>
 * env MEDIASILO_AWS_SQSQ=<THE NAME OF YOUR Q>
 *
 * To run this server as a daemon see birdcall.init. THis can be used os an upstart
 * script on a deb server
 *
 *
 * Company: MediaSilo
 *
 * Author: Mike Delano
 *
 */

var queueConsumer           = require('birdcall-lib').sqs.queueConsumer;
var bunyan                  = require('bunyan');
var bsyslog                 = require('bunyan-syslog');
var prettyStream            = require('bunyan-prettystream');

// Configure logger
var prettyStdOut = new prettyStream();
prettyStdOut.pipe(process.stdout);
var logger = bunyan.createLogger({
    name: "birdcall",
    streams: [{ // For logging to stdout
        level: 'debug',
        type: 'raw',
        stream: prettyStdOut
    },
    { // For logging to syslog
        level: 'debug',
        type: 'raw',
        stream: bsyslog.createBunyanStream({
            type: 'sys',
            facility: bsyslog.local0,
            host: '127.0.0.1',
            port: 514
        })
    }]
});

logger.level("debug");

// Let's get this party started and start eating some event messages
logger.info("Starting birdcall, MediaSilo's web hook runner bot");

queueConsumer({
    logger:logger
});


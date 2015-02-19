'use strict'

/**
 * This file is responsible for consuming the event queue and passing
 * the events to an event handler where they can be routed to various
 * callback strategies.
 *
 * Thanks https://github.com/bigluck/sqs-queue-parallel for this useful package.
 *
 * MediaSilo
 * Mike Delano
 *
 * @type {*}
 */

// Local deps
var eventHandler            = require('../handlers/eventHandler');

// Package deps
var sqsQueueParallel        = require('sqs-queue-parallel');
var bunyan                  = require('bunyan');

module.exports = function(args) {

    // Initialize the logger. If we don't have a logger we'll instantiate a new one
    var logger = args.logger ? args.logger : bunyan.createLogger({name: "birdcall"});
    logger.info('Consuming queue');
    // This queue runner configuration will set up N concurrent runners each of which
    // can receive up to N messages specified by the parameters concurrency and
    // maxNumberOfMessages respectively
    var queue = new sqsQueueParallel({
        name: process.env.MEDIASILO_AWS_SQSQ,
        maxNumberOfMessages: 2,
        concurrency: 5,
        debug:false
    });

    // Event binding for receiving a new queue message
    queue.on('message', function (queueMessage, next)
    {
        logger.debug('Received new event message: ', queueMessage);

        // Delegate the queue message to our event handler
        eventHandler({
            event:queueMessage.data.Message,
            success: function(response){
                logger.debug('Successfully handled event: ', queueMessage, response);
                queueMessage.deleteMessage(); // Clean up after ourselves to prevent other consumers from handling this message as well
            },
            error: function(response){
                logger.error('Error handling event: ', queueMessage, response);
            },
            logger: logger
        })

    });

    // Event binding for failing to receive a new queue message
    queue.on('error', function (err)
    {
        logger.error('There was an error reading an event from the queue: ', err);
    });
}
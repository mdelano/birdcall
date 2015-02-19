'use strict'

/**
 * This handler is responsible for dealing with HTTP callbacks.
 * Currently the handler will post back to the URL set in the
 * web hook registered with Phoenix
 *
 * MediaSilo
 * Mike Delano
 * Developer
 */

var requestify = require('requestify');


module.exports = function(args) {
    // Get the URL that we will be calling back to from the registered
    // webhook that was passed in
    var callbackUrl = args.webhook.transportProperties['endpoint'];

    // We use promises here to handle toe post result
    requestify.post(callbackUrl, JSON.parse(args.body)).then(
        function(response) { // Success
            args.success(response);
        }, function(response) { // Error
            args.error(response);
        }
    );

}

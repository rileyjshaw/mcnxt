/*!
 * ioChannelDefault-node
 */

var chanDefault     = null,
    logger          = require('./utlLogging');

function init(io, callback) { 
    chanDefault = io
	.on('connection', function (socket) {
        logger.info('Connected to default');
        socket.on('terminate', function () { socket.disconnect(); });
	    socket.on('error', function () { logger.error('Error connecting to default channel'); });
        socket.on('disconnect', function () { logger.info('Disconnected from default channel'); });
	})
	return callback(null, chanDefault);
}

 //-- Exports --//
exports.init    =   init;
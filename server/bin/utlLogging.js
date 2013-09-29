/*!
 * utlLogging-node
 * Logger for logging information, warnings and errors
*/

var winston = require('winston'),
    loggerLevels = {
        levels: {
            info:   0,
            warn:   1,
            error:  2
        },
        colors: {
            info:   'green',
            warn:   'yellow',
            error:  'red'
        }
    },
    logger = new (winston.Logger) ({
        transports: [
            new (winston.transports.Console)({level:'warn'}),
            new (winston.transports.File)({ filename: __dirname + '/../logs/linehak.all.log' })
        ],
        levels: loggerLevels.levels
    });

winston.addColors(loggerLevels.colors);
logger.emitErrs = false;

//-- Exports --//
exports.info    = logger.info;
exports.warn    = logger.warn;
exports.error   = logger.error;
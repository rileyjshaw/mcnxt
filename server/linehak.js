var logger      = require('./bin/utlLogging'),
    db          = require("./bin/dbMongo"),
    webServer   = require("./bin/utlWebServer");

logger.info("-----------------------------------------------------------");
logger.info(" Running in " + process.env.NODE_ENV + " mode.");
logger.info("-----------------------------------------------------------");
logger.info("-                                                         -");
logger.info("-                                                         -");

db.init(function (e) {
    if (e) { logger.error(e); process.exit(1); }
    webServer.init();  
});

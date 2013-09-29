/*!
* utlCrypto-node
* General Crypto Layer
*/

var crypto  =   require('crypto'),
    logger  =   require('./utlLogging'),
    err     =   require('./utlErr');

function hashThis(data, callback) { 
    // data -> {type, encodingIn, encodingOut, payload}
    // type can be 'sha1', 'md5', 'sha256', 'sha512'
    // encodingIn can be 'utf8', 'ascii', 'binary'. Defaults to 'binary'.
    // encodingOut can be 'hex', 'binary' or 'base64'. Defaults to 'binary'.

    logger.info('utlCrypto hashThis: ' + data);
    
    if (!data.type || !data.payload) { 
        return callback(-1);
    }

    var shasha = crypto.createHash(data.type);
    
    process.nextTick(function () {
        shasha.update(data.payload, data.encodingIn);
    });
    process.nextTick(function () {
        var digest = shasha.digest(data.encodingOut)
        logger.info('utlCrypto hashThis return: ' + digest);
        return callback(null, digest);
    });
}

function getRandomBytes(data, callback) { //data -> {lengthInBytes, encoding}

    crypto.randomBytes(data.length || 12, function (e, buf) {
        
        logger.info('utlCrypto getRandomBytes');
        if (e) {
            logger.error('utlCrypto getRandomBytes error:' + e);
            return callback(new err.app(205) );
        }
        
        var bufEnc = buf.toString(data.encoding || 'hex');
        logger.info('utlCrypto getRandomBytes return: ' + bufEnc);
        return callback(null, bufEnc)
    });
}

//-- Exports --//
exports.hashThis = hashThis;
exports.getRandomBytes = getRandomBytes;
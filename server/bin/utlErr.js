/*!
 * utlErr-node
 * Error Object Layer
*/

var util = require('util'),
    errs = require('./utlErrStrings');

var AbstractError = function (code, constr) {
    Error.captureStackTrace(this, constr || this)
    this.message = errs.str[code] || 'Error'
    this.code = code;
}
util.inherits(AbstractError, Error)
AbstractError.prototype.name = 'Abstract Error'


var DatabaseError = function (code) {
  DatabaseError.super_.call(this, code, this.constructor)
}
util.inherits(DatabaseError, AbstractError)
DatabaseError.prototype.name = 'Database Error'


var ApplicationError = function (code) {
  ApplicationError.super_.call(this, code, this.constructor)
}
util.inherits(ApplicationError, AbstractError)
ApplicationError.prototype.name = 'Application Error'


module.exports = {
  db: DatabaseError,
  app: ApplicationError
}
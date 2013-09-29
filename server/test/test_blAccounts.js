process.env.testing = "true";

var assert      =   require("assert"),
    accounts    =   require('../bin/blAccounts.js'),
    logger      =   require('../bin/utlLogging'),
    assert      =   require("assert"),
    should      =   require('should');

describe('blAccounts', function () {
    this.timeout(20000);

    describe("#createAccount()", function () {

        var data = [
            '5555555555554444', //card
            '11', //expMonth
            '15', //expYear
            '123', //cvc
            '12000', //amount
            'Something', //desc
            'USD' //currency
        ];

        it('should create a payment', function (done) {
            accounts.createAccount(data, function (e) {
                should.not.exist(e);
                done();
            });
        });

    });
});
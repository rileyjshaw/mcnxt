process.env.testing = "true";

var assert      =   require("assert"),
    simplify    =   require('../bin/blPaymentsSimplify.js'),
    logger      =   require('../bin/utlLogging'),
    assert      =   require("assert"),
    should      =   require('should');

describe('blPaymentsSimplify', function () {
    this.timeout(20000);

    describe("#createPayment()", function () {
        
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
            simplify.createPayment(data, function (e) {
                should.not.exist(e);
                done();
            });
        });

    });
});
"use strict";

var spawn = require('child_process').spawn;

function _request(method, data, callback) {

    var path = '/linehak/py/' + method + '.py';

    data.unshift(path);
    
    var runcmd = spawn('python', data);
    var result = '';

    runcmd.stdout.on('data', function (data) { result += data.toString();});

    runcmd.stdout.on('close', function () {
        if (result == 'Approved\n') callback(null);
        else callback(true);
    });
}

function createPayment (data, cb) { // data = ['5555555555554444', 11, '15', '123', '12000', 'Something', 'USD']
    _request("ChargeWithCard", data, cb);
}

exports.createPayment       =   createPayment;
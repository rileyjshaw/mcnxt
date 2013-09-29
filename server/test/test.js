var spawn = require('child_process').spawn,
    grep  = spawn('python', ['/linehak/py/ChargeWithCard.py','5555555555554444', 11, '15', '123', '11100', 'Something', 'USD']);

console.log('Spawned child pid: ' + grep.pid);

var result = '';

grep.stdout.on('close', function () {
    if (result == 'Approved\n') { 
        console.log('Payment approved!!');
    }
});

grep.stdout.on('data', function (data) {
    result += data.toString();
    
});
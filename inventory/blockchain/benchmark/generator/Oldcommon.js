'use strict';

var AsyncLock = require('async-lock');
var lock = new AsyncLock();
let pidArray = new Array()
let index = 0
let err = 0
let ret = 0
const nthLine = require('read-nth-line');
let nclients = 5
let ntransactions = 36000
let tranperclient = 36000/5
let linenum1 = 1
let linenum2 = tranperclient
let linenum3 = tranperclient * 2
let linenum4 = tranperclient * 3
let linenum5 = tranperclient * 4

module.exports.info = 'Electronic Health Record Chaincode function randomizer';

let bc, contx;

module.exports.init = function (blockchain, context, args) {
    bc = blockchain;
    contx = context;
    return Promise.resolve();
};
module.exports.run = function () {

	if (pidArray.length !=	nclients) {
		lock.acquire(index, function(done) {
    			// async work
			if (pidArray.indexOf(process.pid) == -1) {
				pidArray[index] = process.pid
				index = index + 1
			}
    			done(err, ret);
		}, function(err, ret) {
    			// lock released
		});
	}

	let args;
	if (pidArray[0] == process.pid) {
		try {
  			args = nthLine.readSync('/home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/generator/writeheavy_generatedtransactions.txt', linenum1);
		} catch (err) {
			  console.warn(err);
		}		
		linenum1++
	}
	if (pidArray[1] == process.pid) {
                try {
                        args = nthLine.readSync('/home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/generator/writeheavy_generatedtransactions.txt', linenum2);
                } catch (err) {
                          console.warn(err);
                }
                linenum2++
        }
	if (pidArray[2] == process.pid) {
                try {
                        args = nthLine.readSync('/home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/generator/writeheavy_generatedtransactions.txt', linenum3);
                } catch (err) {
                          console.warn(err);
                }
                linenum3++
        }
	if (pidArray[3] == process.pid) {
                try {
                        args = nthLine.readSync('/home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/generator/writeheavy_generatedtransactions.txt', linenum4);
                } catch (err) {
                          console.warn(err);
                }
                linenum4++
        }
	if (pidArray[4] == process.pid) {
                try {
                        args = nthLine.readSync('/home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/generator/writeheavy_generatedtransactions.txt', linenum5);
                } catch (err) {
                          console.warn(err);
                }
                linenum5++
        }
			
	let argsj = JSON.parse(args);
	return bc.invokeSmartContract(
        contx,
        'generator',
        'v1',
        [argsj],
        30
    );
};


module.exports.end = function () {
return Promise.resolve();
};





'use strict';

var AsyncLock = require('async-lock');
var lock = new AsyncLock();
let txIndex = 1;
let err = 0
let ret = 0
let bc, contx;


const nthLine = require('read-nth-line');

module.exports.info = ' Chaincode function randomizer';


module.exports.init = function (blockchain, context, args) {
    bc = blockchain;
    contx = context;
    return Promise.resolve();
};
module.exports.run = function () {

	lock.acquire(txIndex, function(done) {
                        // async work
                        txIndex++;
                        done(err, ret);
                }, function(err, ret) {
                        // lock released
                });


	let args;
        try {
		args = nthLine.readSync('/home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/generator/uniform_generatedtransactions.txt', txIndex);
		//args = nthLine.readSync('/home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/generator/readheavy_generatedtransactions.txt', txIndex);
		//args = nthLine.readSync('/home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/generator/writeheavy_generatedtransactions.txt', txIndex);
		//args = nthLine.readSync('/home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/generator/insertheavy_generatedtransactions.txt', txIndex);
		//args = nthLine.readSync('/home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/generator/updateheavy_generatedtransactions.txt', txIndex);
		//args = nthLine.readSync('/home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/generator/deleteheavy_generatedtransactions.txt', txIndex);
		//args = nthLine.readSync('/home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/generator/rangeheavy_generatedtransactions.txt', txIndex);
		//args = nthLine.readSync('/home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/generator/couchdbheavy_generatedtransactions.txt', txIndex);

	} catch (err) {
		console.warn(err);
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





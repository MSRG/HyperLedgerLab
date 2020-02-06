'use strict';

module.exports.info = 'Supplychain initLedger: One time operation';

let bc, contx;
module.exports.init = function (blockchain, context, args) {
    console.info("1init function");
    bc = blockchain;
    contx = context;
    return Promise.resolve();
};

module.exports.run = function () {
    console.info("2run function");
    let args;
    if (bc.bcType === 'fabric-ccp') {
	console.info("3if function");
        args = {
            chaincodeFunction: 'initLedger',
            chaincodeArguments: []
        };
    } else {
	console.info("4else function");
        args = {
            verb: 'initLedger'
        };
    }
    return bc.invokeSmartContract(contx, 'supplychain', 'v1', args, 300000);
};

module.exports.end = function () {
    console.info("5end function");
    return Promise.resolve();
};

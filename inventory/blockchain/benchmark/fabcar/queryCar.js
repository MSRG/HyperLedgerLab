'use strict';

module.exports.info = 'Fabcar: Querying cars.';

let txIndex = 0;
let bc, contx;
module.exports.init = function (blockchain, context, args) {
    bc = blockchain;
    contx = context;
    return Promise.resolve();
};

module.exports.run = function () {
    txIndex++;
    let args;
    if (bc.bcType === 'fabric-ccp') {
        args = {
            chaincodeFunction: 'queryCar',
            chaincodeArguments: ['CAR' + (txIndex % 10).toString()]
        };
    } else {
        args = {
            transaction_type: "queryCar",
            CarID: 'CAR' + (txIndex % 10).toString()
        };
    }
    return bc.invokeSmartContract(
        contx,
        'fabcar',
        'v1',
        [args],
        30
    );
};

module.exports.end = function () {
    return Promise.resolve();
};

'use strict';

module.exports.info = 'Fabcar: Querying all cars.';

let bc, contx;
module.exports.init = function (blockchain, context, args) {
    bc = blockchain;
    contx = context;
    return Promise.resolve();
};

module.exports.run = function () {
    let args;
    if (bc.bcType === 'fabric-ccp') {
        args = {
            chaincodeFunction: 'queryAllCars',
            chaincodeArguments: []
        };
    } else {
        args = {
            transaction_type: "queryAllCars"
        };
    }
    return bc.invokeSmartContract(
        contx,
        'fabcar',
        'v1',
        [args],
        120
    );
};

module.exports.end = function () {
    return Promise.resolve();
};

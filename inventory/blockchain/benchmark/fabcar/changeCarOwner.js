'use strict';

module.exports.info = 'Fabcar: Changing Car Owners.';

let txIndex = 0;
let carOwners = ["David", "Sahil", "Philip", "Andrea", "Max", "Zack", "Tom", "Sam", "Akash"];
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
            chaincodeFunction: 'changeCarOwner',
            chaincodeArguments: [
                'CAR' + (txIndex % 10).toString(),
                carOwners[Math.floor(Math.random() * carOwners.length)] + process.pid.toString()
            ]
        };
    } else {
        args = {
            transaction_type: "changeCarOwner",
            CarID: 'CAR' + (txIndex % 10).toString(),
            Owner: carOwners[Math.floor(Math.random() * carOwners.length)] + process.pid.toString()
        };
    }
    txIndex++;
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

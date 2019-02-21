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
    return bc.invokeSmartContract(
        contx,
        'fabcar',
        'v1',
        [{
            transaction_type: "queryCar",
            CarID: 'CAR' + (txIndex % 10).toString()
        }],
        30
    );
};

module.exports.end = function () {
    return Promise.resolve();
};

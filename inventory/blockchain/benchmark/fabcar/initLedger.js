'use strict';

module.exports.info = 'Fabcar initLedger: One time operation';

let bc, contx;
module.exports.init = function (blockchain, context, args) {
    bc = blockchain;
    contx = context;
    return Promise.resolve();
};

module.exports.run = function () {
    return bc.invokeSmartContract(
        contx,
        'fabcar',
        'v1',
        [{
            transaction_type: "initLedger"
        }],
        30
    );
};

module.exports.end = function () {
    return Promise.resolve();
};

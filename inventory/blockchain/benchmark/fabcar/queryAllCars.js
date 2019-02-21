'use strict';

module.exports.info = 'Fabcar: Querying all cars.';

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
            transaction_type: "queryAllCars"
        }],
        120
    );
};

module.exports.end = function () {
    return Promise.resolve();
};

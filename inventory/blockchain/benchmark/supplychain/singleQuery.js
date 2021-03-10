'use strict';

const rand = require('./random');
const seeds = require('./seeds.json');
const getParameters = require('./getParameters');
class singleQuery {

    static get() {

    let args;
    let standardDerivation = getParameters.keyPickerType();
    let randomAccessKey = rand.randomIndex(seeds.allSSCC.length, standardDerivation);
    let ssccKey = seeds.allSSCC[randomAccessKey].toString();

            args = {
                contractId: 'supplychain',
                contractVersion: 'v1',
                contractFunction: 'queryLogisticUnit',
                contractArguments: [ssccKey],
                timeout: 30
            };



            return args;

        }
}

module.exports = singleQuery;


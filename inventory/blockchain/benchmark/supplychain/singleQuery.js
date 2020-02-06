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
            chaincodeFunction: 'queryLogisticUnit',
            chaincodeArguments: [ssccKey]
        };

            return args;

        }
}

module.exports = singleQuery;


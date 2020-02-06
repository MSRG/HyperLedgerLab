/* eslint-disable no-undef */
'use strict';

const rand = require('./random');
const seeds = require('./seeds.json');
const getParameters = require('./getParameters');

class calcRevenue {

    static get() {

    let args;
    let standardDerivation = getParameters.keyPickerType();
    let randomAccessKey = rand.randomIndex(seeds.allIpiName.length, standardDerivation);

    // select random artwork
    while (seeds.allIpiName[randomAccessKey] === undefined) {
        randomAccessKey = rand.randomIndex(seeds.allIpiName.length, standardDerivation);
    }

    const ipiName = seeds.allIpiName[randomAccessKey].IpiName;

    //console.info(`${ipiName} aggregated revenue is calculated`);

        args = {
            chaincodeFunction: 'calcRevenue',
            chaincodeArguments: [ipiName]
        };

            return args;

        }
}

module.exports = calcRevenue;



/* eslint-disable no-undef */
'use strict';

const rand = require('./random');
const seeds = require('./seeds.json');
const getParameters = require('./getParameters');

class pushASN {

    static get() {

    let args;
    let standardDerivation = getParameters.keyPickerType();
    let randomAccessKey = rand.randomIndex(seeds.allSSCC.length, standardDerivation);
    while (seeds.allSSCC[randomAccessKey] === undefined) {
        randomAccessKey = rand.randomIndex(seeds.allSSCC.length, standardDerivation);
    }
    let ssccKey = seeds.allSSCC[randomAccessKey];

    while (seeds.allLsp[randomAccessKey] === undefined) {
        randomAccessKey = rand.randomIndex(seeds.allLsp.length, standardDerivation);
    }
    let lspName = seeds.allLsp[randomAccessKey].name;

    let today = new Date();
    let tomorrow = new Date();
    tomorrow.setDate(today.getDate() + rand.randomZeroToTen());
    let dateString = tomorrow.toString();

        args = {
            chaincodeFunction: 'pushASN',
            chaincodeArguments: [ssccKey, lspName, dateString]
        };

	return args;

        }
}

module.exports = pushASN;


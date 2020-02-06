'use strict';

const rand = require('./random');
const seeds = require('./seeds.json');
const GLN = require('../../src/contract/supplychain/lib/gs1/gln');
const getParameters = require('./getParameters');

class ship {

    static get() {

    let args;
    let standardDerivation = getParameters.keyPickerType();
    let randomAccessKey = rand.randomIndex(seeds.allSSCC.length, standardDerivation);
    while (seeds.allSSCC[randomAccessKey] === undefined) {
        randomAccessKey = rand.randomIndex(seeds.allSSCC.length, standardDerivation);
    }
    let ssccKey = seeds.allSSCC[randomAccessKey];

    randomAccessKey = rand.randomIndex(seeds.allLsp.length, standardDerivation);
    while (seeds.allLsp[randomAccessKey] === undefined) {
        randomAccessKey = rand.randomIndex(seeds.allLsp.length, standardDerivation);
    }
    let newLSPNameString = seeds.allLsp[randomAccessKey].name;
    //console.info(newLSPNameString);
    let gln = new GLN(seeds.allLsp[randomAccessKey].gln.gs1CompanyPrefix, seeds.allLsp[randomAccessKey].gln.locationReference);
    let newLSPGlnString = gln.toString();

        args = {
            chaincodeFunction: 'ship',
            chaincodeArguments: [ssccKey, newLSPNameString, newLSPGlnString]
        };

            return args;

        }
}

module.exports = ship;


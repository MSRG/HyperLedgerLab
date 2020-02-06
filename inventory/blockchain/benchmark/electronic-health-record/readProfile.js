/* eslint-disable no-undef */
'use strict';

const rand = require('./random');
const seeds = require('./seeds');
const getParameters = require('./getParameters');

/*module.exports.info = 'Query profile for ssn';

let bc, contx, standardDerivation;
module.exports.init = function (blockchain, context, args) {
    bc = blockchain;
    contx = context;
    standardDerivation = rand.randomZeroToTen();
    return Promise.resolve();
};

module.exports.run = function () {*/
class readProfile {

    static get() {
            let args;
	    let standardDerivation = getParameters.keyPickerType();
	    let randomAccessKey = rand.randomIndex(seeds.allSSN.length, standardDerivation);

	    while (seeds.allSSN[randomAccessKey] === undefined) {
	        randomAccessKey = rand.randomIndex(seeds.allSSN.length, standardDerivation);
	    }

	    let ssn = seeds.allSSN[randomAccessKey];
	    let key = seeds.allKey[randomAccessKey];

	    args = {
                chaincodeFunction: 'readProfile',
                chaincodeArguments: [ssn, key]
	    };
            return args;

        }
}

module.exports = readProfile;



/*
    if (bc.bcType === 'fabric-ccp') {
        args = {
            chaincodeFunction: 'readProfile',
            chaincodeArguments: [ssn, key]
        };
    }
    return bc.invokeSmartContract(
        contx,
        'electronic-health-record',
        'v1',
        args,
        120
    );
};

module.exports.end = function () {
    return Promise.resolve();
};
*/

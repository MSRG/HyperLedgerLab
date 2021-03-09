/* eslint-disable no-undef */
'use strict';

const rand = require('./random');
const seeds = require('./seeds');
const getParameters = require('./getParameters');

/*module.exports.info = 'Patient grants profile access to an actor';

let bc, contx, standardDerivation;
module.exports.init = function (blockchain, context, args) {
    bc = blockchain;
    contx = context;
    standardDerivation = rand.randomZeroToTen();
    return Promise.resolve();
};

module.exports.run = function () {*/

class grantProfileAccess {

    static get() {
            let args;
	    let standardDerivation = getParameters.keyPickerType();
	    let randomAccessKey = rand.randomIndex(seeds.allActor.length, standardDerivation);

	    // select random actor to give access to
	    while (seeds.allActor[randomAccessKey] === undefined) {
	        randomAccessKey = rand.randomIndex(seeds.allActor.length, standardDerivation);
	    }

	    let actor = seeds.allActor[randomAccessKey];

	    // select random patient giving access
	    let randomAccessKey2 = rand.randomIndex(seeds.allSSN.length, standardDerivation);

	    while (seeds.allSSN[randomAccessKey2] === undefined) {
	        randomAccessKey2 = rand.randomIndex(seeds.allSSN.length, standardDerivation);
	    }

    	    const ssn = seeds.allSSN[randomAccessKey2];
	    const key = seeds.allKey[randomAccessKey2];

	    //console.log(`Patient ${ssn} giving profile access to ${actor}`);
            args = {
                contractId: 'electronic-health-record',
                contractVersion: 'v1',
                contractFunction: 'grantProfileAccess',
                contractArguments: [ssn, key, `${actor}`],
                timeout: 30
            };

	    return args;

        }
}

module.exports = grantProfileAccess;



/*
    if (bc.bcType === 'fabric-ccp') {
        args = {
            chaincodeFunction: 'grantProfileAccess',
            chaincodeArguments: [ssn, key, `${actor}`]
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

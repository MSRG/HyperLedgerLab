/* eslint-disable no-undef */
'use strict';

const rand = require('./random');
const seeds = require('./seeds');
const getParameters = require('./getParameters');

/*module.exports.info = 'Actor queries a EHR';

let bc, contx, standardDerivation;
module.exports.init = function (blockchain, context, args) {
    bc = blockchain;
    contx = context;
    standardDerivation = rand.randomZeroToTen();
    return Promise.resolve();
};

module.exports.run = function () {*/

class queryEhr {

    static get() {
            let args;
	    let standardDerivation = getParameters.keyPickerType();
	    let randomAccessKey = rand.randomIndex(seeds.allActor.length, standardDerivation);

	    while (seeds.allActor[randomAccessKey] === undefined) {
	        randomAccessKey = rand.randomIndex(seeds.allActor.length, standardDerivation);
	    }

	    let actor = seeds.allActor[randomAccessKey];

	    // select random ehr which has been attributed to a patient
	    let randomAccessKey2 = rand.randomIndex(seeds.allEhrUsedId.length, standardDerivation);

	    while (seeds.allEhrUsedId[randomAccessKey2] === undefined) {
	        randomAccessKey2 = rand.randomIndex(seeds.allEhrUsedId.length, standardDerivation);
	    }

	    let ehrId = seeds.allEhrUsedId[randomAccessKey2];

	    //console.info(ehrId);

	    args = {
                chaincodeFunction: 'viewEHR',
                chaincodeArguments: [ehrId, `${actor}`]
            };

	    return args;

        }
}

module.exports = queryEhr;



/*
    if (bc.bcType === 'fabric-ccp') {
        args = {
            chaincodeFunction: 'viewEHR',
            chaincodeArguments: [ehrId, `${actor}`]
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

/* eslint-disable no-undef */
'use strict';

const rand = require('./random');
const seeds = require('./seeds');
const getParameters = require('./getParameters');

/*module.exports.info = 'Patient grants EHR access to an actor';

let bc, contx, standardDerivation;
module.exports.init = function (blockchain, context, args) {
    bc = blockchain;
    contx = context;
    standardDerivation = rand.randomZeroToTen();
    return Promise.resolve();
};

module.exports.run = function () {*/

class grantEhrAccess {

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
	    const profile = seeds.allProfile[ssn];

	    //console.info(profile);

	    // include check if the patient has any ehr
	    // select random ehr from patient

	    if (profile.allEhr !== undefined) {
	        /*let randomAccessKey3 = rand.randomIndex(profile.allEhrUsedId.length, standardDerivation);

	        while (profile.allEhr[randomAccessKey3] === undefined) {
	            randomAccessKey3 = rand.randomIndex(profile.allEhrUsedId.length, standardDerivation);
	        }*/

	        //const ehrId = profile.allEhr[randomAccessKey3].id;
	        const ehrId = profile.allEhr[0].id;

	        //console.log(`Patient ${profile} giving ${ehrId} access to ${actor}`);
            args = {
                contractId: 'electronic-health-record',
                contractVersion: 'v1',
                contractFunction: 'grantEHRAccess',
                contractArguments: [ssn, ehrId, key, `${actor}`],
                timeout: 30
            };

	    } else {
            args = {
                contractId: 'electronic-health-record',
                contractVersion: 'v1',
                contractFunction: 'doNothing',
                contractArguments: [],
                timeout: 30
            };

            }

	    return args;

        }
}

module.exports = grantEhrAccess;





/*        if (bc.bcType === 'fabric-ccp') {
            args = {
                chaincodeFunction: 'grantEHRAccess',
                chaincodeArguments: [ssn, ehrId, key, `${actor}`]
            };
        }
    } else {
        if (bc.bcType === 'fabric-ccp') {
            args = {
                chaincodeFunction: 'doNothing',
                chaincodeArguments: []
            };
        }
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

/* eslint-disable no-undef */
'use strict';

const rand = require('./random');
const seeds = require('./seeds');
const getParameters = require('./getParameters');

/*module.exports.info = 'Patient revokes EHR access from an actor';

let bc, contx, standardDerivation;
module.exports.init = function (blockchain, context, args) {
    bc = blockchain;
    contx = context;
    standardDerivation = rand.randomZeroToTen();
    return Promise.resolve();
};

module.exports.run = function () {*/

class revokeEhrAccess {

    static get() {
	let standardDerivation = getParameters.keyPickerType();
	let args;

	    // select random patient giving access
	    let randomAccessKey2 = rand.randomIndex(seeds.allSSN.length, standardDerivation);

	    while (seeds.allSSN[randomAccessKey2] === undefined) {
	        randomAccessKey2 = rand.randomIndex(seeds.allSSN.length, standardDerivation);
	    }

	    const ssn = seeds.allSSN[randomAccessKey2];
	    const key = seeds.allKey[randomAccessKey2];
	    const profile = seeds.allProfile[ssn];

	    if (profile.allEhr !== undefined) {

	        // select random ehr from patient
		//Object.keys(obj).length
	        //let randomAccessKey3 = rand.randomIndex(profile.allEhrUsedId.length, standardDerivation);
	        /*let randomAccessKey3 = rand.randomIndex(profile.allEhrUsedId.length, standardDerivation);

	        while (profile.allEhr[randomAccessKey3] === undefined) {
	            randomAccessKey3 = rand.randomIndex(profile.allEhrUsedId.length, standardDerivation);
	        }*/

	        //const ehrId = profile.allEhr[randomAccessKey3].id;
	        const ehrId = profile.allEhr[0].id;

	        // select random actor from patient accesslist
        	/*let randomAccessKey = rand.randomIndex(profile.allEhr[randomAccessKey3].accessList.length, standardDerivation);

        	while (profile.allEhr[randomAccessKey3].accessList[randomAccessKey] === undefined) {
        	    randomAccessKey = rand.randomIndex(profile.allEhr[randomAccessKey3].accessList.length, standardDerivation);
        	}*/

        	//const actor = profile.allEhr[randomAccessKey3].accessList[randomAccessKey];
        	const actor = profile.allEhr[0].accessList[0];

        	//console.log(`Patient ${ssn} revoking ${ehrId} access from ${actor}`);

	            args = {
        	        chaincodeFunction: 'revokeEHRAccess',
                	chaincodeArguments: [ssn, ehrId, key, `${actor}`]
            	    };
    		} else {
	            args = {
        	        chaincodeFunction: 'doNothing',
                	chaincodeArguments: []
            	    };
    		}

		return args;

        }
}

module.exports = revokeEhrAccess;

/*
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

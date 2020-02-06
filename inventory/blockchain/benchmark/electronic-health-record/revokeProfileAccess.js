/* eslint-disable no-undef */
'use strict';

const rand = require('./random');
const seeds = require('./seeds');
const getParameters = require('./getParameters');

/*module.exports.info = 'Patient revokes Profile access from an actor';

let bc, contx, standardDerivation;
module.exports.init = function (blockchain, context, args) {
    bc = blockchain;
    contx = context;
    standardDerivation = rand.randomZeroToTen();
    return Promise.resolve();
};

module.exports.run = function () {*/

class revokeProfileAccess {

    static get() {
    let standardDerivation = getParameters.keyPickerType();
    let args;

    // select random patient giving access
    let randomAccessKey2 = rand.randomIndex(seeds.allSSN.length, standardDerivation);

    while (seeds.allSSN[randomAccessKey2] === undefined || seeds.allProfile[seeds.allSSN[randomAccessKey2]] === undefined) {
        randomAccessKey2 = rand.randomIndex(seeds.allSSN.length, standardDerivation);
    }

    const ssn = seeds.allSSN[randomAccessKey2];
    const key = seeds.allKey[randomAccessKey2];
    const profile = seeds.allProfile[ssn];

    if (profile.accessList !== undefined) {
        // select random actor from patient accesslist
	//Object.keys(obj).length
        //let randomAccessKey = rand.randomIndex(profile.accessList.length, standardDerivation);
        /*let randomAccessKey = rand.randomIndex(profile.accessList.length, standardDerivation);

        while (profile.accessList[randomAccessKey] === undefined) {
            randomAccessKey = rand.randomIndex(profile.accessList.length, standardDerivation);
        }*/

        //const actor = profile.accessList[randomAccessKey];
        const actor = profile.accessList[0];

        //console.log(`Patient ${ssn} revoking profile access from ${actor}`);

        //if (bc.bcType === 'fabric-ccp') {
            args = {
                chaincodeFunction: 'revokeProfileAccess',
                chaincodeArguments: [ssn, key, `${actor}`]
            };
        //}
    } else {
        //if (bc.bcType === 'fabric-ccp') {
            args = {
                chaincodeFunction: 'doNothing',
                chaincodeArguments: []
            };
        //}
    }

    return args;

        }
}

module.exports = revokeProfileAccess;


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

/* eslint-disable no-undef */
'use strict';

const rand = require('./random');
const seeds = require('./seeds');
const getParameters = require('./getParameters');
/*module.exports.info = 'Query all EHR for an actor';

let bc, contx, standardDerivation;
module.exports.init = function (blockchain, context, args) {
    bc = blockchain;
    contx = context;
    standardDerivation = rand.randomZeroToTen();
    return Promise.resolve();
};

module.exports.run = function () {*/

class getAllEHRforActor {

    static get() {
	    let standardDerivation = getParameters.keyPickerType();
	    let args;
	    let randomAccessKey = rand.randomIndex(seeds.allActor.length, standardDerivation);

	    while (seeds.allActor[randomAccessKey] === undefined) {
	        randomAccessKey = rand.randomIndex(seeds.allActor.length, standardDerivation);
	    }

	    let actor = seeds.allActor[randomAccessKey];
	    //console.log(`Getting all EHR for ${actor}`);

	     args = {
            	 chaincodeFunction: 'getAllEHRforActor',
            	 chaincodeArguments: [`${actor}`]
	     };
             return args;

        }
}

module.exports = getAllEHRforActor;



/*    if (bc.bcType === 'fabric-ccp') {
        args = {
            chaincodeFunction: 'getAllEHRforActor',
            chaincodeArguments: [`${actor}`]
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

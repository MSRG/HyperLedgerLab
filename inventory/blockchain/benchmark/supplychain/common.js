'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

const getParameters = require('./getParameters');
const queryStock = require('./queryStock');
const singleQuery = require('./singleQuery');
const pushASN = require('./pushASN');
const ship = require('./ship');
const unload = require('./unload');
const queryASN = require('./queryASN');
const fs = require('fs');
const read = require('read-yaml');
const KnuthShuffle = require('./knuthShuffle');
const random = require('./random');
var deck = require('deck');
var Picker = require('random-picker').Picker;
//const parameters = read.sync('parameters.yaml');

const ALLTESTCASE = [
    singleQuery,
    pushASN,
    ship,
    unload,
    queryASN
];

//let readHeavy = {0 : 1, 1 : 1, 2 : 1, 3 : 1, 4 : 10, 5 : 10, 6 : 1, 7 : 1, 8 : 10};
//let writeHeavy = {0 : 10, 1 : 10, 2 : 10, 3 : 10, 4 : 1, 5 : 1, 6 : 10, 7 : 10, 8 : 1};
let readHeavy = [0];
let writeHeavy = [ 1, 2, 3];
//let readHeavy = [0];
//let writeHeavy = [0];

// PROVIDE NUMBER OF TESTCASES
let testCasePermuation = [
    0,
    1,
    2,
    3
];
/*let testCasePermuation = [
    0
];*/


let permutationsToCompute = 1;

function isDefined(t) {
  if (t === undefined) {
     return false;
  }
  return true;
}


/**
 * Workload module for the benchmark round.
 */
class CreateCarWorkload extends WorkloadModuleBase {
    /**
     * Initializes the workload module instance.
     */
    constructor() {
        super();
        this.txIndex = 0;
    }

    /**
     * Assemble TXs for the round.
     * @return {Promise<TxStatus[]>}
     */
    async submitTransaction() {
        this.txIndex++;

    let args;
    let chaincodeType = getParameters.chaincodeType();
    //picker.removeAll();
    var picker = new Picker(); 
    let prob = getParameters.readWriteProb();
    picker.option(0, prob);
    picker.option(1, 100 - prob);

    if (chaincodeType == 0) {
	let uniformPick = deck.pick(testCasePermuation);
	args = ALLTESTCASE[uniformPick].get();
	//console.info('CURRENT CHAINCODE FUNCTION:');
	//console.info(ALLTESTCASE[uniformPick]);
    }
    else if (chaincodeType == 1) {
	let weightedPick = 0;
	if (picker.pick() == 0) {	
		weightedPick = deck.pick(readHeavy);
	}
	else {
		weightedPick = deck.pick(writeHeavy);
	}
	args = ALLTESTCASE[weightedPick].get();
        //console.info('CURRENT CHAINCODE FUNCTION:');
	//console.info(ALLTESTCASE[weightedPick]);
    }
    else if (chaincodeType == 2) {
	let weightedPick = 0;
        if (picker.pick() == 0) {
                weightedPick = deck.pick(writeHeavy);
        }
        else {
                weightedPick = deck.pick(readHeavy);
        }
        args = ALLTESTCASE[weightedPick].get();
        //console.info('CURRENT CHAINCODE FUNCTION:');
        //console.info(ALLTESTCASE[weightedPick]);
    }

        await this.sutAdapter.sendRequests(args);
    }
}
/**
 * Create a new instance of the workload module.
 * @return {WorkloadModuleInterface}
 */
function createWorkloadModule() {
    return new CreateCarWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;





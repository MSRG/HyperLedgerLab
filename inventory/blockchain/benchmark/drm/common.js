'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

const getParameters = require('./getParameters');
const create = require('./create');
const play = require('./play');
const queryRightHolders = require('./queryRightHolders');
const viewMetaData = require('./viewMetaData');
const calcRevenue = require('./calcRevenue');
const fs = require('fs');
const read = require('read-yaml');
const KnuthShuffle = require('./knuthShuffle');
const random = require('./random');
var deck = require('deck');
var Picker = require('random-picker').Picker;

const ALLTESTCASE = [
    create,
    play,
    queryRightHolders,
    viewMetaData,
    calcRevenue
];

let readHeavy = [2, 3, 4];
let writeHeavy = [0, 1];


// PROVIDE NUMBER OF TESTCASES
let testCasePermuation = [
    0,
    1,
    2,
    3,
    4
];

let permutationsToCompute = 1;

function isDefined(t) {
  if (t === undefined) {
     return false;
  }
  return true;
}

class CreateCarWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.txIndex = 0;
    }

    async submitTransaction() {
        this.txIndex++;

    let args;
    let chaincodeType = getParameters.chaincodeType();
    var picker = new Picker(); 
    let prob = getParameters.readWriteProb();
    picker.option(0, prob);
    picker.option(1, 100 - prob);

    if (chaincodeType == 0) {
	let uniformPick = deck.pick(testCasePermuation);
	args = ALLTESTCASE[uniformPick].get();
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
    }

        await this.sutAdapter.sendRequests(args);
    }
}
function createWorkloadModule() {
    return new CreateCarWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;


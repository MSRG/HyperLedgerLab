'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');


var fs = require('fs');
const zeroPad = (num, places) => String(num).padStart(places, '0')


let index = 0
let fileIndex = 0
//let txIndex = 0
let filearray = [];
let err = 0
let nclients = 25
let ntransactions = 144000
let tranperclient = ntransactions/nclients 

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


	let args;
        let argsj;
	

	if (this.txIndex == 0) {
	
                filearray = fs.readFileSync(__dirname + '/workload/wupdateheavy' + zeroPad(clientIdx, 2)).toString().split("\n");
	}

	args = 	filearray[txIndex]	

	this.txIndex++;

	argsj = JSON.parse(args);

        await this.sutAdapter.sendRequests(argsj);
    }
}

/**
 * Create a new instance of the workload module.
 * @return {WorkloadModuleInterface}
 */
function createWorkloadModule() {
	filearray = [];
    return new CreateCarWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;


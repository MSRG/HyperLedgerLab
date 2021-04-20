'use strict';

////const fs = require('fs');
const shell = require('shelljs')
const child_process = require('child_process')

//adaptation interval in milliseconds
const adaptationInterval = 2000;
//adaptationSize: how many metrics to extract from the log
const adaptationSize = 2;
//blockchainLogSize: how many blocks to extract from the blockchain
const blockchainLogSize = 10;
const blocksizeThreshold = 0.5;
const delayThreshold = 0.5;
const reorderingThreshold = 50;
//TODO: extract blocksize from config files
let currentBlockSize = 100; 
//TODO: extract chaincode functions from config files
//const chaincodeFunctions = ['addEhr', 'grantEhrAccess', 'grantProfileAccess', 'queryEhr', 'readProfile', 'revokeEhrAccess', 'revokeProfileAccess', 'viewPartialProfile'];
const chaincodeFunctions=['common', 'common1'];






//code reference: https://stackoverflow.com/questions/45531690/how-to-create-an-infinite-loop-in-nodejs
function adaptationCycle(adaptationCount) {
    setTimeout(() => {
        console.log(adaptationCount, 'th adaptation cycle begins');
	
	let avgST = 0;
	let avgFT = 0;
	let avgSR = 0;
	let avgL = 0;
	let avgT = 0;
        let sendRateRange = new Array(chaincodeFunctions.length);
	//read latest blockchain monitoring reports per chaincodeFunction
	for(let i=0; i<chaincodeFunctions.length; i++) {
		let output = shell.exec('./self_adaptive_unit/extract_metrics.sh ' + chaincodeFunctions[i] + ' ' + adaptationSize)
        	let metrics = output.stdout.split(' ');
        	//metrics=($averageSuccTx $averageFailTx $averageSendRate $averageLatency $averageThroughput)
		let averageSuccTx =  metrics[0];
		let averageFailTx=  metrics[1];
		let averageSendRate =  metrics[2];
		let averageLatency =  metrics[3];
		let averageThroughput =  metrics[4];
        	console.log('averageSuccTx:', averageSuccTx);
        	console.log('averageFailTx:', averageFailTx);
		console.log('averageSendRate:', averageSendRate);
		console.log('averageLatency:', averageLatency);
		console.log('averageThroughput:', averageThroughput);

		avgST += averageSuccTx;
		avgFT += averageFailTx;
		avgSR += averageSendRate;
		avgL += averageLatency;
		avgT += averageThroughput;

		sendRateRange[i] = averageSendRate;

	}
	//average across all functions
	if (chaincodeFunctions.length > 0) { 
		avgST = avgST/chaincodeFunctions.length;
		avgFT = avgFT/chaincodeFunctions.length;
		avgSR = avgSR/chaincodeFunctions.length;
		avgL = avgL/chaincodeFunctions.length;
		avgT = avgT/chaincodeFunctions.length;
	}
	//adaptation logic
	    //ideal block size logic
	if ( (avgSR > (currentBlockSize + (blocksizeThreshold*currentBlockSize))) || (avgSR < (currentBlockSize - (blocksizeThreshold*currentBlockSize)))) {
		
		
		let newBlockSize = Math.floor(avgSR);
		console.log('newBlockSize:', newBlockSize);
	
	
	}
	    //delay logic
	var maxSendRate = Math.max.apply(Math, sendRateRange);
	var averageOtherSendRates = 0;
	var transactionToDelay = '';
	for(let i=0; i<sendRateRange.length; i++) {
		if (sendRateRange[i] != maxSendRate) {
			averageOtherSendRates += sendRateRange[i];
		}
		else {
		     transactionToDelay = chaincodeFunctions[i];
		}
	}
	if ((chaincodeFunctions.length - 1) > 0) {
		averageOtherSendRates = averageOtherSendRates/(chaincodeFunctions.length - 1);
	}
	if (maxSendRate > (averageOtherSendRates + (delayThreshold*averageOtherSendRates))) {
		console.log('delayRequired for the transaction:', transactionToDelay);
	}
	//read blockchain log
	let test = child_process.fork('self_adaptive_unit/getBlockchainLogs.js', [blockchainLogSize]);
	console.log('TEST', test)
	    //generate tx dependency graph
        //adaptation logic
	    //reordering logic
	////if (frequencyOfMaxDependencyPairConflicts > reorderingThreshold){
		
        ////}

        adaptationCycle(++adaptationCount);
    }, adaptationInterval)
}

adaptationCycle(0);



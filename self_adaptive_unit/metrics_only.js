'use strict';


let avgST = 0;
let avgFT = 0;
let avgSR = 0;
let avgL = 0;
let avgT = 0;
let relativeT = 0;



const fs = require('fs');
const yaml = require('js-yaml');
const shell = require('shelljs')

//adaptation interval in milliseconds
const adaptationInterval = 25000;
//adaptationSize: how many metrics to extract from the log
const adaptationSize = 2;
//blockchainLogSize: how many blocks to extract from the blockchain
const blockchainLogSize = 10;
const blocksizeThreshold = 0.5;
const delayThreshold = 0.5;
const reorderingThreshold = 20;
//TODO: extract blocksize from config files
const doc = yaml.load(fs.readFileSync('inventory/blockchain/group_vars/blockchain-setup.yaml', 'utf8'));

let currentBlockSize = doc.fabric_batchsize[0]; 
let prevBlockSize = currentBlockSize

//TODO: extract chaincode functions from config files
//const chaincodeFunctions = ['addEhr', 'grantEhrAccess', 'grantProfileAccess', 'queryEhr', 'readProfile', 'revokeEhrAccess', 'revokeProfileAccess', 'viewPartialProfile'];
const chaincodeFunctions=['common'];

//This location should have config.yaml and for every workload module a modulename_config.yaml file that induces a delay for that specific module
const config_location = 'inventory/blockchain/benchmark/electronic-health-record/'

//get blockchain log
const FabricClient = require('fabric-client');

//var args = process.argv.slice(2);


//adaptationCycle

//code reference: https://stackoverflow.com/questions/45531690/how-to-create-an-infinite-loop-in-nodejs
function adaptationCycle(adaptationCount) {
    setTimeout(() => {
        console.log(adaptationCount, 'th adaptation cycle begins');
	   

	avgST = 0;
	avgFT = 0;
	avgSR = 0;
	avgL = 0;
	avgT = 0;
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
        	/*
		console.log('averageSuccTx:', averageSuccTx);
        	console.log('averageFailTx:', averageFailTx);
		console.log('averageSendRate:', averageSendRate);
		console.log('averageLatency:', averageLatency);
		console.log('averageThroughput:', averageThroughput);
		*/
		avgST = Number(avgST) + Number(averageSuccTx);
		avgFT = Number(avgFT) + Number(averageFailTx);
		avgSR = Number(avgSR) + Number(averageSendRate);
		avgL = Number(avgL) + Number(averageLatency);
		avgT = Number(avgT) + Number(averageThroughput);

		sendRateRange[i] = averageSendRate;
	}
	if (chaincodeFunctions.length > 0) { 
		avgST = Number(avgST)/chaincodeFunctions.length;
		avgFT = Number(avgFT)/chaincodeFunctions.length;
		avgSR = Number(avgSR)/chaincodeFunctions.length;
		avgL = Number(avgL)/chaincodeFunctions.length;
		avgT = Number(avgT)/chaincodeFunctions.length;
	}
		//console.log('averageSuccTx:', avgST);
                //console.log('averageFailTx:', avgFT);
                //console.log('averageSendRate:', avgSR);
                //console.log('averageLatency:', avgL);
                //console.log('averageThroughput:', avgT);

	    let totalTx = avgST + avgFT
	    avgFT = (Number(avgFT)/Number(totalTx)) * 100
	    avgST = (Number(avgST)/Number(totalTx)) * 100
	    relativeT = ((avgSR-avgT)/avgSR) * 100

		var metricsf = fs.createWriteStream("./self_adaptive_unit/10_noadapt_metrics.txt", {flags:'a'});
	        metricsf.write('prevAdaptStrategy 0' + '\n');
        	metricsf.write('Succ ' + avgST + '\n');
        	metricsf.write('Fail ' + avgFT + '\n');
        	metricsf.write('SendRate ' + avgSR + '\n');
        	metricsf.write('Latency ' + avgL + '\n');
        	metricsf.write('Throughput ' + avgT + '\n');
        	metricsf.write('RelativeThroughput ' + relativeT + '\n');
        	metricsf.end();



        adaptationCycle(++adaptationCount);
    }, adaptationInterval)
}

adaptationCycle(0);


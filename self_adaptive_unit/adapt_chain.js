'use strict';

////const fs = require('fs');
const shell = require('shelljs')
//const child_process = require('child_process')
const toposort = require('toposort')
const { GenericGraphAdapter } = require("incremental-cycle-detect");


//adaptation interval in milliseconds
const adaptationInterval = 5000;
//adaptationSize: how many metrics to extract from the log
const adaptationSize = 2;
//blockchainLogSize: how many blocks to extract from the blockchain
const blockchainLogSize = 10;
const blocksizeThreshold = 0.5;
const delayThreshold = 0.5;
const reorderingThreshold = 20;
//TODO: extract blocksize from config files
let currentBlockSize = 100; 
//TODO: extract chaincode functions from config files
//const chaincodeFunctions = ['addEhr', 'grantEhrAccess', 'grantProfileAccess', 'queryEhr', 'readProfile', 'revokeEhrAccess', 'revokeProfileAccess', 'viewPartialProfile'];
const chaincodeFunctions=['common'];

//This location should have config.yaml and for every workload module a modulename_config.yaml file that induces a delay for that specific module
const config_location = 'inventory/blockchain/benchmark/electronic-health-record/'

//get blockchain log
const FabricClient = require('fabric-client');

//var args = process.argv.slice(2);

let conflictTxs = new Map();
let acyclic_conflictTxs = new Map();
var graph = [];
let x = 0;
const acyclicgraph = GenericGraphAdapter.create();
let cyclicedge = [];
let y = 0;

async function setClient() {
	 
	let client =  FabricClient.loadFromConfig('/home/ubuntu/HyperLedgerLab/inventory/blockchain/connectionprofile.yaml')

	await client.initCredentialStores()
	        .then(async (nothing) => {
			await client.setUserContext({username:'admin', password:'adminpw'})
         			.then(async (admin) => {
				
				const channel = client.getChannel();
				let blockchaininfo = await channel.queryInfo();
				let blockchainheight = blockchaininfo.height;
				blockchainheight = blockchainheight|0;
				//console.log(args[0]);
				let startingIndex = (blockchainheight - blockchainLogSize)|0;
				//console.log(startingIndex);
			        const blockchain = [];
				let b = 0;
				for (let index = startingIndex; index < blockchainheight; index++) {
					/*b = await channel.queryBlock(index)
						.then(async (nothing) => {
							console.log('Getting blockchain log');
							blockchain.push(b);
						
						})*/
					//blockchain.push(b);
                    			blockchain.push(await channel.queryBlock(index));
					//console.log('blockchain', blockchain);

                		}
			        for (let blockindex = 0; blockindex < blockchain.length ; blockindex++) {
				        //console.log('block contents', blockchain[blockindex]);					
    					let blocksize = blockchain[blockindex].data.data.length;
					//console.log('blocksize:', blocksize);
                			let txstatus = blockchain[blockindex].metadata.metadata[2];
                			for (let txindex = 0; txindex < blocksize; txindex++) {
						let conflictpair1 = '';
						let conflictpair2 = '';
						let conflictpair = '';
						let conflict = [];
					        var readKeys = new Array();
						if (txstatus[txindex] == 11) {
							let txactions = blockchain[blockindex].data.data[txindex].payload.data.actions
							if (txactions != undefined) {
								let rwsetsize = txactions[0].payload.action.proposal_response_payload.extension.results.ns_rwset.length;
								if (rwsetsize > 1) {
									//rwindex maybe 0 or 1 for different use cases
									for (let rwindex = 1; rwindex < rwsetsize; rwindex++) {
						  				let rwset = txactions[0].payload.action.proposal_response_payload.extension.results.ns_rwset[rwindex];
						  				let readsetsize = rwset.rwset.reads.length;
        	                                  				let rindex = 0;
 	                                          				if (rwset.namespace != 'lscc') {
                                                  					while (rindex < readsetsize) {
                                                        					readKeys.push(rwset.rwset.reads[rindex].key);
                                                                				rindex++;
                                                        				}
                                                  				}
									}
								
								
								}
							
							}

							let txbuffer = txactions[0].payload.chaincode_proposal_payload.input.chaincode_spec.input.args[0];
							let txname = String.fromCharCode.apply(null, txbuffer);
							conflictpair1 = txname;
							conflict[0] = txname;
							//console.log('Conflict pair1', txname);
						let pairDetected = 0;

						for (let newindex = (txindex - 1); newindex >= 0; newindex--) {
						
							let txactions = blockchain[blockindex].data.data[newindex].payload.data.actions
							if (txactions != undefined) {
							
								let rwsetsize = txactions[0].payload.action.proposal_response_payload.extension.results.ns_rwset.length;
								if (rwsetsize > 1) {
									//rwindex maybe 0 or 1 for different use cases
                                                                        for (let rwindex = 1; rwindex < rwsetsize; rwindex++) {
									
										let rwset = txactions[0].payload.action.proposal_response_payload.extension.results.ns_rwset[rwindex];
                                                                                let writesetsize = rwset.rwset.writes.length;
                                                                                let windex = 0;
                                                                                if (rwset.namespace != 'lscc') {
                                                                                        while (windex < writesetsize) {

												if (readKeys.includes(rwset.rwset.writes[windex].key)) {
                                                                 				      
													pairDetected = 1;
													let txbuffer = txactions[0].payload.chaincode_proposal_payload.input.chaincode_spec.input.args[0];
                                                        						let txname = String.fromCharCode.apply(null, txbuffer);
                                                        						//console.log('Conflict pair2', txname);
													//console.log(' ');
													conflictpair2 = txname;
													conflict[1] = txname;
													conflictpair = conflictpair1 + ' ' + conflictpair2;
													if (conflictTxs.has(conflictpair)){
														conflictTxs.set(conflictpair, (conflictTxs.get(conflictpair))+1);
													}
													else {
														conflictTxs.set(conflictpair, 1);
														if (!(acyclicgraph.addEdge(conflictpair1, conflictpair2))){
															cyclicedge[y] = conflictpair;
															y++;
														}
														else {
															graph[x] = conflict;
															x++;
														}
													}
                                                                        				break;
                                                                				}

                                                                                                windex++;
                                                                                        }
											if (pairDetected == 1){
												break;
											}
                                                                                }

									
									
									}
									if (pairDetected == 1){
                                                                        	break;
                                                                        }

								
								}
							}
						
						}
						/*if (pairDetected == 0){
                                                	console.log('No conflict pair2');
							console.log(' ');
                                                }*/

					
					}
				
				
				}

				}

				//console.log(conflictTxs);

          			return channel;

							
							
				})
						
						
		})



}

//adaptationCycle

//code reference: https://stackoverflow.com/questions/45531690/how-to-create-an-infinite-loop-in-nodejs
function adaptationCycle(adaptationCount) {
    setTimeout(() => {
        console.log(adaptationCount, 'th adaptation cycle begins');
        setClient()
                .then((channel) => {
                        //console.log('Client setup successful')


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
	
	//adaptation logic
	    //ideal block size logic
	if ( (avgSR > (currentBlockSize + (blocksizeThreshold*currentBlockSize))) || (avgSR < (currentBlockSize - (blocksizeThreshold*currentBlockSize)))) {
		
		
		let newBlockSize = Math.floor(avgSR);
		console.log('newBlockSize:', newBlockSize);
		const { stdout, stderr } = shell.exec('./self_adaptive_unit/config_tx.sh ' + newBlockSize)
		//console.log('stderr:', stderr);
		if (stderr.includes("error")) {
			console.log('BLOCKSIZE NOT ADAPTED');
		}
		else {
			currentBlockSize = newBlockSize;
		}
		
	
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
	if ((chaincodeFunctions.length > 1) && (maxSendRate > (averageOtherSendRates + (delayThreshold*averageOtherSendRates)))) {
		console.log('delayRequired for the transaction:', transactionToDelay);
		//shell.exec('cp inventory/blockchain/benchmark/electronic-health-record/delay_config.yaml inventory/blockchain/benchmark/electronic-health-record/config.yaml');
		shell.exec('cp ' + config_location + transactionToDelay + '_config.yaml' + ' ' + config_location + 'config.yaml');
	}

	//read blockchain log
 	//console.log(conflictTxs);
	try {
        	//console.log('Topologically sorted', toposort(graph).reverse());
		//console.log('Cyclic edges', cyclicedge);
		//console.log('All conflict pairs:', conflictTxs);
		var acyclic_conflict = [];
		var acyclic_graph = [];
		let p = 0
		for (let [key, value] of conflictTxs) {
			let txpair = key.split(' ');
			let rev_txpair = txpair[1] + ' ' + txpair[0]
			//console.log(rev_txpair);
			if (!(conflictTxs.has(rev_txpair))){
				acyclic_conflictTxs.set(key, value);
				acyclic_conflict[0] = txpair[0];
				acyclic_conflict[1] = txpair[1];
				acyclic_graph[p] = acyclic_conflict.slice();
				p++;
			}
		}
		
 		//console.log('All acyclic conflict pairs:', acyclic_conflictTxs);
 		//console.log('Acyclic graph:', acyclic_graph);
		console.log('Topologically sorted', toposort(acyclic_graph).reverse());


		//TODO logic
		//var intersection = orderArray.filter(inWorkingArray);
		//var c=0;
		//workingArray.map(function(x){
    		//	return notInOrderArray(x) ? x : intersection[c++];
		//});





	}
	catch(error) {
		console.log(error);
	
	}
        //adaptation logic
            //reordering logic
        ////if (frequencyOfMaxDependencyPairConflicts > reorderingThreshold){

        ////}






  	})
  	.then(() => { 
		//console.log('Client setup complete')
	});

        adaptationCycle(++adaptationCount);
    }, adaptationInterval)
}

adaptationCycle(0);



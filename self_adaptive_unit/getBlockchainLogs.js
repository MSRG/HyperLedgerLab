/*
TODO: Automate these steps.

1. cp inventory/blockchain/fabric_ccp_network.yaml inventory/blockchain/connectionprofile.yaml

2. edit connectionprofile.yaml such that there is only one client as shown below:
client:
      organization: Org1
      credentialStore:
        path: /tmp/1615470564-cred/org1
        cryptoStore:
          path: /tmp/1615470564-crypto/org1
      clientPrivateKey:
        path: /home/ubuntu/HyperLedgerLab/inventory/blockchain/fabric-config/crypto-config/peerOrganizations/org1/users/User1@org1/msp/keystore/priv_sk
      clientSignedCert:
        path: /home/ubuntu/HyperLedgerLab/inventory/blockchain/fabric-config/crypto-config/peerOrganizations/org1/users/User1@org1/msp/signcerts/User1@org1-cert.pem
	
	
3. mkdir data if it does not exist. rm data/* if it exists.
*/


'use strict';

const fs = require('fs');
const FabricClient = require('fabric-client');

var args = process.argv.slice(2);

let conflictTxs = new Map();


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
				let startingIndex = (blockchainheight -  parseInt(args[0]))|0;
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
                			let txstatus = blockchain[blockindex].metadata.metadata[2];
                			for (let txindex = 0; txindex < blocksize; txindex++) {
						let conflictpair1 = '';
						let conflictpair2 = '';
						let conflictpair = '';
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
													conflictpair = conflictpair1 + ' ' + conflictpair2;
													if (conflictTxs.has(conflictpair)){
														conflictTxs.set(conflictpair, (conflictTxs.get(conflictpair))+1);
													}
													else {
														conflictTxs.set(conflictpair, 1);
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
						if (pairDetected == 0){
                                                	console.log('No conflict pair2');
							console.log(' ');
                                                }

					
					}
				
				
				}

				}

				//console.log(conflictTxs);

				/*for (let index = startingIndex; index < blockchainheight; index++) {
					
					
					var fileName = "/home/ubuntu/HyperLedgerLab/data/" + index + ".json";
    					fs.writeFile(
                          				fileName,
			                                JSON.stringify((await channel.queryBlock(index)), null, 4),
                  					function (err) {
                              						if (err) {
                                 						console.error('Saving BLOCK failed');
                              							}
                          						}
                    						);
                		}*/



          			return channel;

							
							
				})
						
						
		})



}

setClient()
  .then((channel) => { 
	  console.log('Client setup successful')

  })
  .then(() => { console.log('Client setup complete')});


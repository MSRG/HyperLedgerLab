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
				console.log(blockchainheight);
				for (let index = 0; index < blockchainheight; index++) {
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
                		}



          			return channel;

							
							
				})
						
						
		})



}

setClient()
  .then((channel) => { 
	  console.log('Client setup successful')

  })
  .then(() => { console.log('Client setup complete')});


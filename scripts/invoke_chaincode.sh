#!/bin/bash

orgNumbers=2 #$1
peerNumbers=2 #$2
contractFolderName=electronic-health-record #$3
contractName=electronic-health-record #$4

cliNames=()
kubectl=./inventory/cluster/artifacts/kubectl.sh

set_cli_names () {
    for i in $(seq 1 $orgNumbers);
    do
        $kubectl -n org${i} get pods
        cliNames[$i]=$($kubectl -n org${i} get pods --no-headers -o custom-columns=":metadata.name" | grep cli-)
    done
}

invoke_chaincode () {
    kubeCommand="${kubectl} -n org1 exec -it ${cliNames[1]} -- "
    $kubeCommand peer chaincode invoke --peerAddresses peer0.org1:7051 --peerAddresses peer1.org1:7051 --peerAddresses peer0.org2:7051 --peerAddresses peer1.org2:7051 --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org1/peers/peer0.org1/tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org1/peers/peer1.org1/tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org2/peers/peer0.org2/tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org2/peers/peer1.org2/tls/ca.crt -C mychannel -n electronic-health-record --tls --cafile /etc/hyperledger/fabric/crypto-config/ordererOrganizations/orgorderer1/orderers/orderer0.orgorderer1/msp/tlscacerts/tlsca.orgorderer1-cert.pem -c '{"Args":["doNothing"]}' --waitForEvent
    #$kubeCommand peer chaincode invoke -C mychannel -n supplychain --tls --cafile /etc/hyperledger/fabric/crypto-config/ordererOrganizations/orgorderer1/orderers/orderer0.orgorderer1/msp/tlscacerts/tlsca.orgorderer1-cert.pem -c '{"Args":["doNothing"]}'
}


set_cli_names
invoke_chaincode


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

copy_contract () {
    for i in $(seq 1 $orgNumbers);
    do
        $kubectl cp inventory/blockchain/src/contract/${contractFolderName}/. ${cliNames[$i]}:./${contractFolderName} -n org${i}
    done
}

install_channel_org1 () {
    createChannelCommands=(
        "peer channel create -c mychannel --orderer orderer0.orgorderer1:7050 --tls --cafile /etc/hyperledger/fabric/crypto-config/ordererOrganizations/orgorderer1/orderers/orderer0.orgorderer1/msp/tlscacerts/tlsca.orgorderer1-cert.pem -f ./channel-artifacts/mychannel.tx"
        "peer channel join -b ./mychannel.block"
        "peer channel list"
        "env CORE_PEER_ADDRESS=peer1.org1:7051 peer channel join -b mychannel.block"
        "env CORE_PEER_ADDRESS=peer1.org1:7051 peer channel list"
    )

    for cmd in "${createChannelCommands[@]}"
    do
        $kubectl -n org1 exec -it ${cliNames[1]} -- $cmd
    done
}

join_channel_other_orgs () {
    # starts from org 2
    for org in $(seq 2 $orgNumbers);
    do
        corePeerAddress=${corePeerAddresses[$org]}
        joinChannelCommands=(
            "peer channel fetch newest mychannel.block --orderer orderer0.orgorderer1:7050 --tls --cafile /etc/hyperledger/fabric/crypto-config/ordererOrganizations/orgorderer1/orderers/orderer0.orgorderer1/msp/tlscacerts/tlsca.orgorderer1-cert.pem -c mychannel"
            "peer channel join -b mychannel.block"
            "peer channel list"
            # "/bin/bash -c \"export CORE_PEER_ADDRESS=${corePeerAddress}\""
            "env CORE_PEER_ADDRESS=peer1.org${org}:7051 peer channel join -b mychannel.block"
            "env CORE_PEER_ADDRESS=peer1.org${org}:7051 peer channel list"
        )

        for cmd in "${joinChannelCommands[@]}"
        do
            echo $cmd
            $kubectl -n org${org} exec -it ${cliNames[$org]} -- $cmd
        done
    done
}

install_chaincode () {
    for org in $(seq 1 $orgNumbers);
    do  
        kubeCommand="${kubectl} -n org$org exec -it ${cliNames[$org]} -- "

        $kubeCommand peer lifecycle chaincode package ${contractName}.tar.gz --path ./${contractFolderName}/ --lang node --label ${contractName}

        for peer in $(seq 0 $(($peerNumbers-1)));
        do
            $kubeCommand peer lifecycle chaincode install ${contractName}.tar.gz --peerAddresses peer${peer}.org${org}:7051 --tls --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org${org}/peers/peer${peer}.org${org}/tls/ca.crt

            $kubeCommand peer lifecycle chaincode queryinstalled --peerAddresses peer${peer}.org${org}:7051 --output json --tls --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org${org}/peers/peer${peer}.org${org}/tls/ca.crt > log.txt
        done
        
        # get package id
        PACKAGE_ID=$(cat log.txt | cat log.txt | grep package_id | cut -d'"' -f4)

        # this might not work - only temporary?? - we need to export env to every action??
        $kubeCommand /bin/bash -c 'export ORDERER_CA=/etc/hyperledger/fabric/crypto-config/ordererOrganizations/orgorderer1/orderers/orderer0.orgorderer1/msp/tlscacerts/tlsca.orgorderer1-cert.pem; echo $ORDERER_CA'

        #$kubeCommand peer lifecycle chaincode approveformyorg -o orderer0.orgorderer1:7050 --peerAddresses peer0.org${org}:7051 --peerAddresses peer1.org${org}:7051 --channelID mychannel --name electronic-health-record --version 1.0 --signature-policy "OR('Org1MSP.member','Org2MSP.member')" --init-required --package-id ${PACKAGE_ID} --sequence 1 --tls true --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org${org}/peers/peer0.org${org}/tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org${org}/peers/peer1.org${org}/tls/ca.crt --cafile /etc/hyperledger/fabric/crypto-config/ordererOrganizations/orgorderer1/orderers/orderer0.orgorderer1/msp/tlscacerts/tlsca.orgorderer1-cert.pem
        $kubeCommand peer lifecycle chaincode approveformyorg -o orderer0.orgorderer1:7050 --peerAddresses peer0.org${org}:7051 --peerAddresses peer1.org${org}:7051 --channelID mychannel --name electronic-health-record --version 1.0 --package-id ${PACKAGE_ID} --sequence 1 --tls true --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org${org}/peers/peer0.org${org}/tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org${org}/peers/peer1.org${org}/tls/ca.crt --cafile /etc/hyperledger/fabric/crypto-config/ordererOrganizations/orgorderer1/orderers/orderer0.orgorderer1/msp/tlscacerts/tlsca.orgorderer1-cert.pem

        for peer in $(seq 0 $(($peerNumbers-1)));
        do
            #$kubeCommand peer lifecycle chaincode checkcommitreadiness --peerAddresses peer${peer}.org${org}:7051 -o orderer0.orgorderer1:7050 -o orderer0.orgorderer1:7050 --channelID mychannel --tls true --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org${org}/peers/peer${peer}.org${org}/tls/ca.crt --cafile /etc/hyperledger/fabric/crypto-config/ordererOrganizations/orgorderer1/msp/tlscacerts/tlsca.orgorderer1-cert.pem --cafile /etc/hyperledger/fabric/crypto-config/ordererOrganizations/orgorderer1/msp/tlscacerts/tlsca.orgorderer1-cert.pem --name electronic-health-record --signature-policy "OR('Org1MSP.member','Org2MSP.member')" --version 1.0 --init-required --sequence 1
            $kubeCommand peer lifecycle chaincode checkcommitreadiness --peerAddresses peer${peer}.org${org}:7051 -o orderer0.orgorderer1:7050 -o orderer0.orgorderer1:7050 --channelID mychannel --tls true --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org${org}/peers/peer${peer}.org${org}/tls/ca.crt --cafile /etc/hyperledger/fabric/crypto-config/ordererOrganizations/orgorderer1/msp/tlscacerts/tlsca.orgorderer1-cert.pem --cafile /etc/hyperledger/fabric/crypto-config/ordererOrganizations/orgorderer1/msp/tlscacerts/tlsca.orgorderer1-cert.pem --name electronic-health-record --version 1.0 --sequence 1
        done
    done
}

commit_chaincode () {
    kubeCommand="${kubectl} -n org1 exec -it ${cliNames[1]} -- "

    #$kubeCommand peer lifecycle chaincode commit --peerAddresses peer0.org1:7051 --peerAddresses peer1.org1:7051 --peerAddresses peer0.org2:7051 --peerAddresses peer1.org2:7051 -o orderer0.orgorderer1:7050 --channelID mychannel --init-required --name electronic-health-record --version 1.0 --sequence 1 --signature-policy "OR('Org1MSP.member','Org2MSP.member')" --tls true --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org1/peers/peer0.org1/tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org1/peers/peer1.org1/tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org2/peers/peer0.org2/tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org2/peers/peer1.org2/tls/ca.crt --cafile /etc/hyperledger/fabric/crypto-config/ordererOrganizations/orgorderer1/msp/tlscacerts/tlsca.orgorderer1-cert.pem
    $kubeCommand peer lifecycle chaincode commit --peerAddresses peer0.org1:7051 --peerAddresses peer1.org1:7051 --peerAddresses peer0.org2:7051 --peerAddresses peer1.org2:7051 -o orderer0.orgorderer1:7050 --channelID mychannel --name electronic-health-record --version 1.0 --sequence 1 --tls true --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org1/peers/peer0.org1/tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org1/peers/peer1.org1/tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org2/peers/peer0.org2/tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org2/peers/peer1.org2/tls/ca.crt --cafile /etc/hyperledger/fabric/crypto-config/ordererOrganizations/orgorderer1/msp/tlscacerts/tlsca.orgorderer1-cert.pem

    #$kubeCommand peer chaincode invoke -C mychannel --isInit -n electronic-health-record --tls --cafile /etc/hyperledger/fabric/crypto-config/ordererOrganizations/orgorderer1/orderers/orderer0.orgorderer1/msp/tlscacerts/tlsca.orgorderer1-cert.pem -c '{"Args":["doNothing"]}'
    $kubeCommand peer chaincode invoke -C mychannel -n electronic-health-record --tls --cafile /etc/hyperledger/fabric/crypto-config/ordererOrganizations/orgorderer1/orderers/orderer0.orgorderer1/msp/tlscacerts/tlsca.orgorderer1-cert.pem -c '{"Args":["doNothing"]}'

    sleep 3

    $kubeCommand peer chaincode invoke -C mychannel -n electronic-health-record --tls --cafile /etc/hyperledger/fabric/crypto-config/ordererOrganizations/orgorderer1/orderers/orderer0.orgorderer1/msp/tlscacerts/tlsca.orgorderer1-cert.pem -c '{"Args":["doNothing"]}'
}


invoke_chaincode () {
    kubeCommand="${kubectl} -n org1 exec -it ${cliNames[1]} -- "
    $kubeCommand peer chaincode invoke --peerAddresses peer0.org1:7051 --peerAddresses peer1.org1:7051 --peerAddresses peer0.org2:7051 --peerAddresses peer1.org2:7051 --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org1/peers/peer0.org1/tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org1/peers/peer1.org1/tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org2/peers/peer0.org2/tls/ca.crt --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org2/peers/peer1.org2/tls/ca.crt -C mychannel -n electronic-health-record --tls --cafile /etc/hyperledger/fabric/crypto-config/ordererOrganizations/orgorderer1/orderers/orderer0.orgorderer1/msp/tlscacerts/tlsca.orgorderer1-cert.pem -c '{"Args":["doNothing"]}i' --waitForEvent
    #$kubeCommand peer chaincode invoke -C mychannel -n electronic-health-record --tls --cafile /etc/hyperledger/fabric/crypto-config/ordererOrganizations/orgorderer1/orderers/orderer0.orgorderer1/msp/tlscacerts/tlsca.orgorderer1-cert.pem -c '{"Args":["doNothing"]}'
}


set_cli_names
copy_contract
install_channel_org1
join_channel_other_orgs
install_chaincode
commit_chaincode
#invoke_chaincode


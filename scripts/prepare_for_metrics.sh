#TODO: This script works when only one chaincode is defined in the setup. It fails with multiple chaincodes.
#TODO: The CHAINCODE_INIT_FUNCTION variable has to be changed manually.
#TODO: Fix path issues for fabcar 
#!/usr/bin/env bash
set +ex

parse_var () {
    grep -v '^#' ${BLOCKCHAIN_SETUP_FILE} |grep -o "$1.*" |awk '{print $2}'
}

run_in_org_cli () {
    inventory/cluster/artifacts/kubectl.sh -n "org$1" exec deploy/cli -- bash -c "$2"
}

copy_to_org_cli () {
    inventory/cluster/artifacts/kubectl.sh -n "org$1" cp $2 $(inventory/cluster/artifacts/kubectl.sh -n "org$1" get pods -l app=cli --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}'):$3
}

export BLOCKCHAIN_SETUP_FILE="inventory/blockchain/group_vars/blockchain-setup.yaml"
export ORDERER_DOMAIN=$(parse_var 'fabric_orderer_domain:')
export CHANNEL_ARTIFACTS_DIR_NAME=$(parse_var 'channel_artifacts_dirname:')
export CRYPTO_CONFIG_DIRNAME=$(parse_var 'crypto_config_dirname:')
export NUM_OF_ORG=$(parse_var 'fabric_num_orgs:');
export FABRIC_PEERS_PER_ORG=$(parse_var 'fabric_peers_per_org:')
export CHANNEL_NAME=$(parse_var '\sname:')
export CHAINCODE_ID=$(parse_var 'id:')
export CHAINCODE_PATH=$(parse_var 'path:')
export CHAINCODE_LABEL="${CHAINCODE_ID}"
export CHAINCODE_LANGUAGE=$(parse_var 'language:')
#TODO: Get this folder path from ansible?
export SRC_DIR="inventory/blockchain/src/contract"
#export CONTRACT_DIRNAME=$(parse_var 'contract_dirname:' |  tr -d '"')
export CONTRACT_DIRNAME="${CHAINCODE_ID}"
export FABRIC_CFG_PATH=$(run_in_org_cli 1 "printenv FABRIC_CFG_PATH")
export ORDERER_CA="${FABRIC_CFG_PATH}/${CRYPTO_CONFIG_DIRNAME}/ordererOrganizations/${ORDERER_DOMAIN}/orderers/orderer0.${ORDERER_DOMAIN}/msp/tlscacerts/tlsca.${ORDERER_DOMAIN}-cert.pem"

#TODO: Current init function is only valid for fabcar chaincode
export CHAINCODE_INIT_FUNCTION="doNothing"

echo "Creating ${CHANNEL_NAME}..."
run_in_org_cli 1 "peer channel create -c ${CHANNEL_NAME} --orderer orderer0.${ORDERER_DOMAIN}:7050 --tls --cafile ${ORDERER_CA} -f ./${CHANNEL_ARTIFACTS_DIR_NAME}/${CHANNEL_NAME}.tx"

echo "Joining all peers of org1 to ${CHANNEL_NAME}..."
for ((i = 0; i < ${FABRIC_PEERS_PER_ORG}; i++)); do
    run_in_org_cli 1 "CORE_PEER_ADDRESS=peer${i}.org1:7051; peer channel join -b ./${CHANNEL_NAME}.block"
done

echo "Joining all peers of all organizations to ${CHANNEL_NAME}..."
for ((i = 2; i <= ${NUM_OF_ORG}; i++)); do
    run_in_org_cli $i "peer channel fetch newest ./${CHANNEL_NAME}.block --orderer orderer0.${ORDERER_DOMAIN}:7050 --tls --cafile ${ORDERER_CA} -c ${CHANNEL_NAME}"
    for ((j = 0; j < ${FABRIC_PEERS_PER_ORG}; j++)); do
        run_in_org_cli $i "CORE_PEER_ADDRESS=peer${j}.org${i}:7051; peer channel join -b ./${CHANNEL_NAME}.block"
    done
done

echo "Creating and installing chaincode ${CHAINCODE_ID} for all organizations..."
for ((i = 1; i <= ${NUM_OF_ORG}; i++)); do
    copy_to_org_cli ${i} "${SRC_DIR}/${CONTRACT_DIRNAME}/." "./${CONTRACT_DIRNAME}/"
    run_in_org_cli ${i} "go get github.com/hyperledger/fabric-contract-api-go/contractapi"
    run_in_org_cli ${i} "peer lifecycle chaincode package ${CHAINCODE_ID}.tar.gz --path \"./${CONTRACT_DIRNAME}/\" --lang ${CHAINCODE_LANGUAGE} --label ${CHAINCODE_LABEL}"
    for ((j = 0; j < ${FABRIC_PEERS_PER_ORG}; j++)); do
        run_in_org_cli ${i} "peer lifecycle chaincode install ${CHAINCODE_ID}.tar.gz --peerAddresses peer${j}.org${i}:7051 --tls --tlsRootCertFiles ${FABRIC_CFG_PATH}/${CRYPTO_CONFIG_DIRNAME}/peerOrganizations/org${i}/peers/peer${j}.org${i}/tls/ca.crt"
    done
done

#SIGNATURE_POLICY="OR('Org1MSP.member'"
#for ((i = 2; i <= ${NUM_OF_ORG}; i++)); do
#    SIGNATURE_POLICY+=", 'Org${i}MSP.member'"
#done
#SIGNATURE_POLICY+=")"

echo "Approving chaincode for all organizations..."
for ((i = 1; i <= ${NUM_OF_ORG}; i++)); do
	for ((j = 0; j < ${FABRIC_PEERS_PER_ORG}; j++)); do
    		PACKAGE_ID=$(run_in_org_cli ${i} "peer lifecycle chaincode queryinstalled" |sed -n "s/Package ID:\s*\(\S*\),.*$/\1/p")
		PEERS_IN_ORG+="--peerAddresses peer${j}.org${i}:7051 --tlsRootCertFiles ${FABRIC_CFG_PATH}/${CRYPTO_CONFIG_DIRNAME}/peerOrganizations/org${i}/peers/peer${j}.org${i}/tls/ca.crt "

	done
	run_in_org_cli $i "peer lifecycle chaincode approveformyorg ${PEERS_IN_ORG} -o orderer0.${ORDERER_DOMAIN}:7050 --channelID ${CHANNEL_NAME} --name ${CHAINCODE_ID} --version 1.0 --package-id ${PACKAGE_ID} --sequence 1 --tls true --cafile ${ORDERER_CA}"
	echo "1"
	PEERS_IN_ORG=""

done


ALL_PEERS=""
for ((i = 1; i <= ${NUM_OF_ORG}; i++)); do
    for ((j = 0; j < ${FABRIC_PEERS_PER_ORG}; j++)); do
        ALL_PEERS+="--peerAddresses peer${j}.org${i}:7051 "
    done
done

echo "Check commit readiness of chaincode for all organizations..."

for ((i = 1; i <= ${NUM_OF_ORG}; i++)); do
    for ((j = 0; j < ${FABRIC_PEERS_PER_ORG}; j++)); do
        ALL_PEERS+="--tlsRootCertFiles ${FABRIC_CFG_PATH}/${CRYPTO_CONFIG_DIRNAME}/peerOrganizations/org${i}/peers/peer${j}.org${i}/tls/ca.crt "
        CURRENT_PEER="--peerAddresses peer${j}.org${i}:7051 --tlsRootCertFiles ${FABRIC_CFG_PATH}/${CRYPTO_CONFIG_DIRNAME}/peerOrganizations/org${i}/peers/peer${j}.org${i}/tls/ca.crt "
	run_in_org_cli 1 "peer lifecycle chaincode checkcommitreadiness ${CURRENT_PEER} -o orderer0.${ORDERER_DOMAIN}:7050 --tls true --cafile ${ORDERER_CA} --channelID ${CHANNEL_NAME} --name ${CHAINCODE_ID} --version 1.0 --sequence 1"
	echo "2"
    done
done

echo "Committing the chaincode to all peers..."
run_in_org_cli 1 "peer lifecycle chaincode commit ${ALL_PEERS} --channelID ${CHANNEL_NAME} --name ${CHAINCODE_ID} --version 1.0 --sequence 1 --tls true --cafile ${ORDERER_CA} --waitForEvent"

echo "Invoking the chaincode..."
run_in_org_cli 1 "peer chaincode invoke ${ALL_PEERS} --channelID ${CHANNEL_NAME} --name ${CHAINCODE_ID} --tls --cafile ${ORDERER_CA} -c '{\"Args\":[\"${CHAINCODE_INIT_FUNCTION}\"]}' --waitForEvent"


set -ex

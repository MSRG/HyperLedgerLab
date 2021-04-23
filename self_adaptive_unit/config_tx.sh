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

run_in_org_cli_with_newenv () {
    inventory/cluster/artifacts/kubectl.sh -n "org$1" exec deploy/cli -- sh -c "CORE_PEER_LOCALMSPID=Orgorderer1MSP CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/crypto-config/ordererOrganizations/orgorderer1/orderers/orderer0.orgorderer1/tls/ca.crt && CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/crypto-config/ordererOrganizations/orgorderer1/users/Admin\@orgorderer1/msp && CORE_PEER_ADDRESS=orderer0.orgorderer1:7050 && ${2}"
}

#copy_to_org_cli () {
#    inventory/cluster/artifacts/kubectl.sh -n "org$1" cp $2 $(inventory/cluster/artifacts/kubectl.sh -n "org$1" get pods -l app=cli --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}'):$3
#}


CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/crypto-config/ordererOrganizations/orgorderer1/orderers/orderer0.orgorderer1/tls/ca.crt
CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/crypto-config/ordererOrganizations/orgorderer1/users/Admin\@orgorderer1/msp
CORE_PEER_ADDRESS=orderer0.orgorderer1:7050


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


#ALL_PEERS=""
#for ((i = 1; i <= ${NUM_OF_ORG}; i++)); do
#    for ((j = 0; j < ${FABRIC_PEERS_PER_ORG}; j++)); do
#        ALL_PEERS+="--peerAddresses peer${j}.org${i}:7051 "
#    done
#done

#for ((i = 1; i <= ${NUM_OF_ORG}; i++)); do
#    for ((j = 0; j < ${FABRIC_PEERS_PER_ORG}; j++)); do
#         ALL_PEERS+="--tlsRootCertFiles ${FABRIC_CFG_PATH}/${CRYPTO_CONFIG_DIRNAME}/peerOrganizations/org${i}/peers/peer${j}.org${i}/tls/ca.crt "
#    done
#done

#echo "Invoking the chaincode..."
#run_in_org_cli 1 "peer chaincode invoke ${ALL_PEERS} --channelID ${CHANNEL_NAME} --name ${CHAINCODE_ID} --tls --cafile ${ORDERER_CA} -c '{\"Args\":[\"${CHAINCODE_INIT_FUNCTION}\"]}' --waitForEvent"

#echo "$ORDERER_DOMAIN"
#echo "${CHANNEL_NAME}"
#echo "${ORDERER_CA}"

#MAXBATCHSIZEPATH=”.channel_group.groups.Orderer.values.BatchSize.value.max_message_count”
#docker exec -e MAXBATCHSIZEPATH=$MAXBATCHSIZEPATH cli sh -c ‘jq “$MAXBATCHSIZEPATH” config.json’
#docker exec -e MAXBATCHSIZEPATH=$MAXBATCHSIZEPATH cli sh -c ‘jq “$MAXBATCHSIZEPATH = 20” config.json > modified_config.json’
#blocksize="\".channel_group.groups.Orderer.values.BatchSize.value.max_message_count=${1} | .channel_group.groups.Orderer.values.BatchTimeout.value={timeout:2s}\""
blocksize=".channel_group.groups.Orderer.values.BatchSize.value.max_message_count"
#docker exec  cli sh -c 'echo "{\"payload\":{\"header\":{\"channel_header\":{\"channel_id\":\"mychannel\", \"type\":2}},\"data\":{\"config_update\":"$(cat final_update.json)"}}}" | jq . >  header_in_envolope.json'
header="'{\"payload\":{\"header\":{\"channel_header\":{\"channel_id\":\"mychannel\", \"type\":2}},\"data\":{\"config_update\":'\$(cat ./config_update.json)'}}}'"

echo ${header}

echo "Sending config transaction"
run_in_org_cli 1 "peer channel fetch config ./config_block.pb -o orderer0.${ORDERER_DOMAIN}:7050 -c ${CHANNEL_NAME} --tls --cafile ${ORDERER_CA}"
run_in_org_cli 1 "configtxlator proto_decode --input ./config_block.pb --type common.Block --output ./config_block.json"
run_in_org_cli 1 "jq .data.data[0].payload.data.config ./config_block.json > ./config.json"
run_in_org_cli 1 "cp ./config.json ./modified_config.json"
run_in_org_cli 1 "jq \"${blocksize} = ${1}\" ./config.json > ./modified_config.json" 
run_in_org_cli 1 "configtxlator proto_encode --input ./config.json --type common.Config --output ./config.pb"
run_in_org_cli 1 "configtxlator proto_encode --input ./modified_config.json --type common.Config --output ./modified_config.pb"
run_in_org_cli 1 "configtxlator compute_update --channel_id ${CHANNEL_NAME} --original ./config.pb --updated ./modified_config.pb --output ./config_update.pb"
run_in_org_cli 1 "configtxlator proto_decode --input ./config_update.pb --type common.ConfigUpdate --output ./config_update.json"
run_in_org_cli 1 "echo ${header} | jq . > ./config_update_in_envelope.json"
run_in_org_cli 1 "configtxlator proto_encode --input ./config_update_in_envelope.json --type common.Envelope --output ./config_update_in_envelope.pb"
run_in_org_cli_with_newenv 1 "peer channel update -f ./config_update_in_envelope.pb -c ${CHANNEL_NAME} -o orderer0.${ORDERER_DOMAIN}:7050 --tls --cafile ${ORDERER_CA}"

set -ex

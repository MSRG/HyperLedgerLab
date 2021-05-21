#!/bin/bash
# $1 = orderer 
# $2 = channel name
# $3 = block size
# $4 = block interval

# clean directory
rm -rf ./out
mkdir ./out
export BASE_DIR=/home/ubuntu/HyperLedgerLab/inventory/blockchain/fabric-config
export PATH=${BASE_DIR}/bin:$PATH
export FABRIC_CFG_PATH=${BASE_DIR}/

# !IMPORTANT! hardcoded values, change with your own
# orderer CA root
export ORDERER_CA=${BASE_DIR}/crypto-config/ordererOrganizations/orgorderer1/orderers/orderer.orgorderer1/msp/tlscacerts/tlsca.orgorderer1-cert.pem
export TLS_ROOT_CA=${BASE_DIR}/crypto-config/ordererOrganizations/orgorderer1/msp/tlscacerts/tlsca.orgorderer1-cert.pem

# defaut orderer address !IMPORTANT! hardcoded default value, adjust with ansible conf if necessary
export ORDERER_CONTAINER=orderer
export ORDERER_ADDRESS=orderer0.orgorderer1:7050

export CORE_PEER_LOCALMSPID="OrdererMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${BASE_DIR}/crypto-config/ordererOrganizations/orgorderer1/orderers/orderer$1.orgorderer1/msp/tlscacerts/tlsca.orgorderer1-cert.pem
export CORE_PEER_MSPCONFIGPATH=${BASE_DIR}/crypto-config/ordererOrganizations/orgorderer1/users/Admin@orgorderer1/msp
export ORDERER_TLS=${BASE_DIR}/crypto-config/ordererOrganizations/orgorderer1/orderers/orderer$1.orgorderer1/tls/server.crt

# peer channel fetch config ./out/config_block.pb -o orderer0.orgorderer1:7050 -c mychannel --tls --cafile /var/hyperledger/orderer/msp/tlscacerts/tlsca.orgorderer1-cert.pem
peer channel fetch config ./out/config_block.pb -o $ORDERER_ADDRESS -c $2 --tls --cafile $TLS_ROOT_CA

configtxlator proto_decode --input ./out/config_block.pb --type common.Block --output ./out/config_block.json

jq .data.data[0].payload.data.config ./out/config_block.json > ./out/config.json

cp ./out/config.json ./out/modified_config.json

jq ".channel_group.groups.Orderer.values.BatchSize.value.max_message_count=$3 | .channel_group.groups.Orderer.values.BatchTimeout.value={\"timeout\":\"$4\"}" ./out/config.json > ./out/modified_config.json

echo "calculating config differences"
configtxlator proto_encode --input ./out/config.json --type common.Config --output ./out/config.pb

configtxlator proto_encode --input ./out/modified_config.json --type common.Config --output ./out/modified_config.pb

configtxlator compute_update --channel_id $2 --original ./out/config.pb --updated ./out/modified_config.pb --output ./out/config_update.pb

echo "applying changes"
configtxlator proto_decode --input ./out/config_update.pb --type common.ConfigUpdate --output ./out/config_update.json

echo '{"payload":{"header":{"channel_header":{"channel_id":"'$2'", "type":2}},"data":{"config_update":'$(cat ./out/config_update.json)'}}}' | jq . > ./out/config_update_in_envelope.json

configtxlator proto_encode --input ./out/config_update_in_envelope.json --type common.Envelope --output ./out/config_update_in_envelope.pb

echo "submit update transaction"
peer channel update -f ./out/config_update_in_envelope.pb -c $2 -o $ORDERER_ADDRESS --tls --cafile $TLS_ROOT_CA

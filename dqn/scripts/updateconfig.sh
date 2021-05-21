#!/usr/bin/env bash
set +ex

parse_var () {
    grep -v '^#' ${BLOCKCHAIN_SETUP_FILE} |grep -o "$1.*" |awk '{print $2}'
}
run_in_org_cli () {
    /home/ubuntu/HyperLedgerLab/inventory/cluster/artifacts/kubectl.sh -n "org$1" exec deploy/cli -- bash -c "$2"
}

export ORDERER_DOMAIN=$(parse_var 'fabric_orderer_domain:')
export CHANNEL_NAME=$(parse_var '\sname:')
export FABRIC_CFG_PATH=$(run_in_org_cli 1 "printenv FABRIC_CFG_PATH")
export ORDERER_CA="${FABRIC_CFG_PATH}/${CRYPTO_CONFIG_DIRNAME}/ordererOrganizations/${ORDERER_DOMAIN}/orderers/orderer0.${ORDERER_DOMAIN}/msp/tlscacerts/tlsca.${ORDERER_DOMAIN}-cert.pem"

echo $ORDERER_DOMAIN
echo $CHANNEL_NAME
echo $FABRIC_CFG_PATH
echo $ORDERER_CA

set -ex
#!/usr/bin/env bash
# Script to run benchmark for a chaincode
# Chaincode defaults to marbles
# Chaincode name can be provided by CLI: e.g get_metrics.sh fabcar

source `dirname $0`/setup_env.sh node

base_dir=$INVENTORY_DIR_PATH/blockchain/benchmark

chaincode=fabcar
if [[ ! -z $1 ]]
then
    chaincode=$1
fi

benchmark_dir=$base_dir/$chaincode

#set -x
#kubectl -f distrib-caliper/k8s_calip apply
#npx caliper launch manager --caliper-bind-sut fabric:latest-v2 --caliper-benchconfig $benchmark_dir/config.yaml --caliper-networkconfig $INVENTORY_DIR_PATH/blockchain/fabric_ccp_network.yaml --caliper-fabric-gateway-enabled --caliper-flow-only-test
#set +x

#!/usr/bin/env bash

source `dirname $0`/setup_env.sh

args=''

if [[ $1 = "cli" ]]
then
    args="-e fabric_create_cli=true"
fi

if [[ ! -z $2 ]]
then
    args="$args -e fabric_boot_wait=$2"
fi

set -x
# Setup Hyperledger fabric blockchain on k8s
ansible-playbook -i inventory/blockchain/hosts.ini $args -v blockchain_setup.yaml
set +x
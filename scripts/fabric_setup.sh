#!/usr/bin/env bash

source `dirname $0`/setup_env.sh

# Arguments can be provided to this script for various variables available in
# inventory/blockchain/group_vars/blockchain-setup.yaml
#
# For example:
# To change orderer type to kafka
# >>> sh fabric_setup.sh -e fabric_orderer_type=kafka
#
# To create cli pods in Peer orgs
# >>> sh fabric_setup.sh -e fabric_create_cli=true
#
# To change batch size
# >>> sh fabric_setup.sh -e '{"fabric_batchsize":["20","128 MB","128 MB"]}'
#
# To do both of above
# >>> sh fabric_setup.sh -e fabric_orderer_type=kafka -e fabric_create_cli=true

set -x
# Setup Hyperledger fabric blockchain on k8s
ansible-playbook -i inventory/blockchain/hosts.ini -v blockchain_setup.yaml "$@"
set +x

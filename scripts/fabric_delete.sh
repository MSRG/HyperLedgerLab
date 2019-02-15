#!/usr/bin/env bash

source `dirname $0`/setup_env.sh

set -x
# Delete Hyperledger fabric blockchain on k8s
ansible-playbook -i inventory/blockchain/hosts.ini -v blockchain_delete.yaml
set +x
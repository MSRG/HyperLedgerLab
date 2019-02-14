#!/usr/bin/env bash

source `dirname $0`/setup_env.sh

# Delete Hyperledger fabric blockchain on k8s
ansible-playbook -i inventory/blockchain/hosts.ini -v blockchain_delete.yaml

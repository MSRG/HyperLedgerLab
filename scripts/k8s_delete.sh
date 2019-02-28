#!/usr/bin/env bash

source `dirname $0`/setup_env.sh

set -x
# Delete Openstack instances
ansible-playbook -i inventory/infra/hosts.ini -v infra_delete.yaml
# Delete Fabric config if leftover
ansible-playbook -i inventory/blockchain/hosts.ini -v playbooks/delete_fabric_config.yaml
set +x
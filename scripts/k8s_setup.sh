#!/usr/bin/env bash

source `dirname $0`/setup_env.sh

set -x
# Setup Openstack instances for k8s nodes
ansible-playbook -i inventory/infra/hosts.ini -v infra_setup.yaml

echo "Waiting 30 seconds for Openstack instances to boot ....."
sleep 30

# Setup k8s cluster
ansible-playbook -i inventory/cluster/hosts.ini -v cluster_setup.yaml
set +x

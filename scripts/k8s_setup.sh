#!/usr/bin/env bash

source `dirname $0`/setup_env.sh

# Setup Openstack instances for k8s nodes
ansible-playbook -i inventory/infra/hosts.ini -v infra_setup.yaml

echo "Waiting for Openstack instances to boot ....."
sleep 20

# Setup k8s cluster
ansible-playbook -i inventory/cluster/hosts.ini -v cluster_setup.yaml

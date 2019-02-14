#!/usr/bin/env bash

source `dirname $0`/setup_env.sh

# Delete Openstack instances
ansible-playbook -i inventory/infra/hosts.ini -v infra_delete.yaml

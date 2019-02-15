#!/usr/bin/env bash

set -e

# cd to project root
cd `dirname $0`/..

# Set environment variables required for Openstack and k8s cluster setup
if [[ -f .env ]]
then
    set -x
    source .env
    set +x
else
    echo "Create a .env file. Take env_sample as example"
    exit 1
fi

# Setup python environment
if [[ -d venv ]]
then
    set -x
    source venv/bin/activate
    set +x
else
    set -x
    mkdir venv
    sudo apt update
    sudo apt install python-pip
    pip install virtualenv
    virtualenv --python=python3 venv
    source ./venv/bin/activate
    pip install -r requirements.txt
    pip install -r kubespray/requirements.txt
    set +x
fi

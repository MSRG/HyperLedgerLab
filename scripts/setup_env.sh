#!/usr/bin/env bash

set -e

# cd to project root
cd `dirname $0`/..

# Update the submodule code
set -x
git submodule sync
git submodule update --init --recursive
set +x

# Set environment variables required for Openstack and k8s cluster setup
if [[ -f .env ]]
then
    echo "source .env"
    source .env
else
    echo "Create a .env file. Take env_sample as example"
    exit 1
fi

if [[ $1 = "node" ]]
then
    if [[ ! -d node_modules ]]
    then
        # Setup node environment
        set -x
        curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
        sudo apt-get install -y nodejs
        sudo npm install -g npm
        npm install
        npm run fabric-v1.4-deps
        set +x
    fi
else
    # Setup python environment
    if [[ -d venv ]]
    then
        echo "source venv/bin/activate"
        source venv/bin/activate
    else
        set -x
        mkdir venv
        sudo apt update
        sudo apt-get install --yes python-pip
        pip install virtualenv
        virtualenv --python=python3 venv
        source ./venv/bin/activate
        pip install -r requirements.txt
        pip install -r kubespray/requirements.txt
        set +x
    fi
fi

# Create ansible.log file if not present
if [[ ! -f ansible.log ]]
then
    touch ansible.log
fi
#!/bin/bash

yes | ./scripts/k8s_delete.sh
sudo rm -rf venv
sudo rm -rf node_modules/
./scripts/k8s_setup.sh


#!/bin/bash

../inventory/cluster/artifacts/kubectl.sh -f ../distrib-caliper/k8s_calip delete
../inventory/cluster/artifacts/kubectl.sh -f ../distrib-caliper/k8s_calip/ apply 

sleep 10

# get manager pods
export MANAGER_NAME="$(../inventory/cluster/artifacts/kubectl.sh get pods --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}' | grep manager)"

# get logs
script -c '../inventory/cluster/artifacts/kubectl.sh logs -f $MANAGER_NAME' caliper-logs.txt
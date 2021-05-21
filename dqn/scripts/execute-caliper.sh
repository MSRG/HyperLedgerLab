#!/bin/bash

# !IMPORTANT! hardcoded values, change with your own
cd /home/ubuntu/HyperLedgerLab
rm caliper.log

./scripts/get_metrics.sh 
cp report.html dqn/report.html
# report_name=`date +"%Y-%m-%d-%T-report.html"`
# caliper launch manager --caliper-bind-sut fabric:2.2 --caliper-bind-cwd ./ --caliper-benchconfig benchmarks/fabcar/config.yaml --caliper-networkconfig fabric-node-tls.yaml --caliper-flow-only-test --caliper-fabric-gateway-enabled --caliper-fabric-gateway-discovery --caliper-fabric-gateway-localhost=true
# --caliper-report-path $report_name 

# discovery has a bug in 0.3.2 (PR #853 caliper)
# --caliper-fabric-gateway-gatewaylocalhost --caliper-fabric-gateway-discovery 

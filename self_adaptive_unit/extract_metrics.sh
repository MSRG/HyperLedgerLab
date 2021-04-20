#!/bin/bash
#node_modules/nip/bin/nip "function(l) { return / ${1}/.test(l); }" caliper.log >> metrics.log

#Name 2
#Succ 4
#Fail 6
#Send Rate (TPS)8
#Max Latency (s)10
#Min Latency (s)12
#Avg Latency (s)14
#Throughput (TPS)16
#chaincodeFuntion=$(grep " ${1}" caliper.log | awk '{print $2}')
averageSuccTx=$(grep " ${1}" caliper.log | tail -$2 | awk '{print $4}' | awk '{ SUM += $1} END { print SUM/NR }')
averageFailTx=$(grep " ${1}" caliper.log | tail -$2 | awk '{print $6}' | awk '{ SUM += $1} END { print SUM/NR }')
averageSendRate=$(grep " ${1}" caliper.log | tail -$2 | awk '{print $8}' | awk '{ SUM += $1} END { print SUM/NR }')
averageLatency=$(grep " ${1}" caliper.log | tail -$2 | awk '{print $14}' | awk '{ SUM += $1} END { print SUM/NR }')
averageThroughput=$(grep " ${1}" caliper.log | tail -$2 | awk '{print $16}' | awk '{ SUM += $1} END { print SUM/NR }')
metrics=($averageSuccTx $averageFailTx $averageSendRate $averageLatency $averageThroughput)
echo "${metrics[@]}"

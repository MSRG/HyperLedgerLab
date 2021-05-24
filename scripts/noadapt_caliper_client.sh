#!/usr/bin/env bash
# Script to run benchmark for a chaincode
# Chaincode defaults to marbles
# Chaincode name can be provided by CLI: e.g get_metrics.sh fabcar

source `dirname $0`/setup_env.sh node

base_dir=$INVENTORY_DIR_PATH/blockchain/benchmark

chaincode=fabcar
if [[ ! -z $1 ]]
then
    chaincode=$1
fi

benchmark_dir=$base_dir/$chaincode

set -x
init=1
rounds=0
delay=10

durationrange=(15 30 25 30 5)
tpsrange=(120 150 200 100 10)

#durationrange=(20 5 20 5 15)
#tpsrange=(10 40 10 100 20)

#durationrange=(20 5 20 5 15)
#tpsrange=(40 20 120 100 40)

#durationrange=(10 5 5 10 20)
#tpsrange=(120 40 120 100 100)

#durationrange=(15 30 25 30 10)
#tpsrange=(120 80 20 100 60)


#declare -a durationlist=()
#declare -a tpslist=()

#totaldurationrange=(5 10 20 30)
#totaltpsrange=(10 50 100 150)
#rangeindex=0
#rangelength=3

#durationrange=( $(shuf -e ${totaldurationrange[@]}))
#echo ${durationrange[@]}

#tpsrange=( $(shuf -e ${totaltpsrange[@]}))
#echo ${tpsrange[@]}

echo $((1 + $RANDOM % 10))

#while :
while [ $rounds -lt 5 ]
do
# loop infinitely
if [[ $init -eq 1 ]]
then
	node inventory/blockchain/benchmark/electronic-health-record/workload/transactiongenerator.js
	npx caliper launch manager --caliper-bind-sut fabric:latest-v2 --caliper-benchconfig $benchmark_dir/init_config.yaml --caliper-networkconfig $INVENTORY_DIR_PATH/blockchain/fabric_ccp_network.yaml --caliper-fabric-gateway-enabled --caliper-flow-only-test
	init=0
	echo "START METRICS COLLECTION"
else
	txDuration=${durationrange[$rounds]}
	tps=${tpsrange[$rounds]}
	durationlist+=($txDuration)	
	tpslist+=($tps)
	#txDuration=${durationrange[$rangeindex]}
	#tps=${tpsrange[$rangeindex]}
	echo $txDuration
	echo $tps
	newDuration=$[$txDuration/2]
	if grep -q delay "/home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/electronic-health-record/config.yaml"; then
		sed -i "8s/.*/      txDuration: ${newDuration}/" /home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/electronic-health-record/config.yaml
        	sed -i "17s/.*/      txDuration: ${delay}/" /home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/electronic-health-record/config.yaml
        	sed -i "25s/.*/      txDuration: ${newDuration}/" /home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/electronic-health-record/config.yaml
        	sed -i "s/^            tps: .*$/            tps: ${tps}/" /home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/electronic-health-record/config.yaml
	else
		sed -i "8s/.*/      txDuration: ${txDuration}/" /home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/electronic-health-record/config.yaml
        	sed -i "s/^            tps: .*$/            tps: ${tps}/" /home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/electronic-health-record/config.yaml
	fi

	sed -i "8s/.*/      txDuration: ${newDuration}/" /home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/electronic-health-record/delay_config.yaml
        sed -i "17s/.*/      txDuration: ${delay}/" /home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/electronic-health-record/delay_config.yaml
        sed -i "25s/.*/      txDuration: ${newDuration}/" /home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/electronic-health-record/delay_config.yaml
        sed -i "s/^            tps: .*$/            tps: ${tps}/" /home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/electronic-health-record/delay_config.yaml


	subrounds=0
	while [ $subrounds -lt 3 ]
	do
		node inventory/blockchain/benchmark/electronic-health-record/workload/transactiongenerator.js
		npx caliper launch manager --caliper-bind-sut fabric:latest-v2 --caliper-benchconfig $benchmark_dir/config.yaml --caliper-networkconfig $INVENTORY_DIR_PATH/blockchain/fabric_ccp_network.yaml --caliper-fabric-gateway-enabled --caliper-flow-only-test
	subrounds=$[$subrounds+1]
done

fi
rounds=$[$rounds+1]
#rangeindex=$[$rangeindex+1]
#if [ $rangeindex -gt rangelength]
#	rangeindex=0
#fi
done
pkill -f node
echo ${durationlist[@]}
echo ${tpslist[@]}
#echo "${durationlist[@]}" > self_adaptive_unit/dur.txt
#echo "${tpslist[@]}" > self_adaptive_unit/tps.txt
#printf $durationlist >> self_adaptive_unit/dur.txt
#printf $tpslist >> self_adaptive_unit/tps.txt
set +x

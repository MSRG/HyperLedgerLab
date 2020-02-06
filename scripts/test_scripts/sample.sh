#!/usr/bin/env bash

echo "TestNumber        BlockSize       Tps     Key     TotalSuccess    TotalFailure    TotalFailure2   MVCC    Inter   Intra   Endorsement     Phantom         Throughput      AvgLatency" >> formattedlog.txt
for i in 1 2 3 4 5
do
        for k in 10 30 50 70 90 110
        do
                sed -i "s/^fabric_batchsize: .*$/fabric_batchsize: [\"${k}\", \"2 MB\", \"2 MB\"]/" /home/ubuntu/hyperledgerlab-macrobenchmarks/inventory/blockchain/group_vars/blockchain-setup.yaml
                for j in 10 50 100
                do
                        sed -i "23s/.*/        tps: ${j}/" /home/ubuntu/hyperledgerlab-macrobenchmarks/inventory/blockchain/benchmark/electronic-health-record/config.yaml
                        for l in 10 50 100
                        do
                                sed -i "6s/.*/        let keyStdDev = ${l};/" /home/ubuntu/hyperledgerlab-macrobenchmarks/inventory/blockchain/benchmark/electronic-health-record/getParameters.js

                                echo "Starting test${i} with key ${l}, block size ${k} and tps ${j}"
                                ./scripts/run_benchmark.sh electronic-health-record > log.txt
                                sleep 5s
                                echo "Ended test${i} with key ${l}, block size ${k} and tps ${j}"
                                cat log.txt | grep "| 2    | common" > temp12.txt
                                cat log.txt | grep "Total Tx Failures =" > temp1.txt
                                cat log.txt | grep "Total MVCC Failures =" > temp2.txt
                                cat log.txt | grep "Total IntraBlock Failures =" > temp3.txt
                                cat log.txt | grep "Total Cross Block Failures =" > temp4.txt
                                cat log.txt | grep "Total Endorsement Failures =" > temp5.txt
                                cat log.txt | grep "Total Phantom Read Failures =" > temp6.txt
                                cat log.txt | grep "Total Other Failures =" > temp7.txt

                                paste <(echo "${i}      ${k}            ${j}            ${l}     ") <(awk '{print $6}' temp12.txt)  <(awk '{print $8}' temp12.txt) <(awk '{print $9}' temp1.txt) <(awk '{print $9}' temp2.txt) <(awk '{print $9}' temp3.txt) <(awk '{print $10}' temp4.txt) <(awk '{print $9}' temp5.txt) <(awk '{print $10}' temp6.txt) <(awk '{print $9}' temp7.txt) <(awk '{print $22}' temp12.txt) <(awk '{print $19}' temp12.txt)>> formattedlog.txt

                                true > nohup.out
                                rm /home/ubuntu/hyperledgerlab-macrobenchmarks/report*
                                rm /home/ubuntu/hyperledgerlab-macrobenchmarks/temp*
                                rm /home/ubuntu/hyperledgerlab-macrobenchmarks/log.txt
                                rm /home/ubuntu/hyperledgerlab-macrobenchmarks/completelog.txt
                                rm -rf /home/ubuntu/.ansible/tmp/
                                rm -rf /home/ubuntu/hyperledgerlab-macrobenchmarks/caliper/log/
   done
                done
        done
done
echo "Completed all tests"




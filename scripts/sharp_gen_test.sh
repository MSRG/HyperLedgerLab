#!/usr/bin/env bash


runbenchmark() {

#run benchmark -- save to ${x}_${ExpNum}log.txt
#collect metrics -- save to "${x}metricslog.csv"

ExpNum=$1
x=$2
i=$3
j=$4
k=$5
l=$6
m=$7
n=$8
o=$9
p=${10}
q=${11}
R=${12}
s=${13}
#if [s -eq 0]
if [ $s -eq 0 ]
then
 t=${14}
#NA=0
 u=0
 v=0
else
 t=0
 u=${14}
 v=${15}
fi

#RUN BENCHMARK

#.UseCase values: EHR = 0, DV = 1, SCM = 2, DRM = 3
#usecase=(electronic-health-record e-voting supplychain drm)
#./scripts/run_benchmark.sh ${usecase[${i}]} > ${x}_${ExpNum}log.txt
#./scripts/run_benchmark.sh electronic-health-record > ${x}_${ExpNum}log.txt
./scripts/fabric_delete.sh
sleep 120s
./scripts/gen_run_benchmark.sh generator  > ${x}_${ExpNum}log.txt


printf "\n" >> "${x}metricslog.csv"

#printf "ExpNum\tUseCase\tWorkloadType\tRWProbability\tTPS\tTxDuration\tKeyDistType\tZipSkew\tPercentHotKeys\tProbHotKeys\tBlockSize\tNumOfOrgs\tPeersPerOrg\tEndorsePolicy\tDatabase\t" >> "${x}metricslog.csv"
printf "%.2f\t%.2f\t%.2f\t%.2f\t%.2f\t%.2f\t%.2f\t%.2f\t%.2f\t%.2f\t%.2f\t%.2f\t%.2f\t%.2f\t%.2f\t" ${ExpNum} ${i} ${j} ${k} ${l} ${m} ${s} ${t} ${u} ${v} ${n} ${o} ${p} ${q} ${R} >> "${x}metricslog.csv"

#### COLLECT PERFORMANCE METRICS #####

#TotTxSubmitted tps*txduration
printf "%.2f\t" $((l * m)) >> "${x}metricslog.csv"
#SuccTxBC
totsucc=$(grep 'Total Tx Succeeds' ${x}_${ExpNum}log.txt | awk '{print $9}')
init=$(grep '| 1    | initLedger' ${x}_${ExpNum}log.txt | awk '{print $6}')
succ=$((totsucc - init))
#succ=$((totsucc))
printf "%.2f\t" $succ >> "${x}metricslog.csv"
#SuccTxCal
printf "%.2f\t" $(grep '| 2    | common' ${x}_${ExpNum}log.txt | awk '{print $6}') >> "${x}metricslog.csv"
#FailTxBC
totfail=$(grep 'Total Tx Failures =' ${x}_${ExpNum}log.txt | awk '{print $9}')
init=$(grep '| 1    | initLedger' ${x}_${ExpNum}log.txt | awk '{print $8}')
fail=$((totfail - init))
#fail=$((totfail))
printf "%.2f\t" $fail >> "${x}metricslog.csv"
#FailTxCal
printf "%.2f\t" $(grep '| 2    | common' ${x}_${ExpNum}log.txt | awk '{print $8}') >> "${x}metricslog.csv"
#TotCommTxBC
totcomm=$((succ + fail))
printf "%.2f\t" $((succ + fail)) >> "${x}metricslog.csv"
#TotCommTxCal
printf "%.2f\t" $(grep '| 2    | common' ${x}_${ExpNum}log.txt | awk '{print $10}') >> "${x}metricslog.csv"
#EndorseFailBC
#printf "%.2f\t" $(grep 'Total Endorsement Failures' ${x}_${ExpNum}log.txt | awk '{print $9}') >> "${x}metricslog.csv"
endfail=$(grep 'Total Endorsement Failures' ${x}_${ExpNum}log.txt | awk '{print $9}')
endinit=$(grep '| 1    | initLedger' ${x}_${ExpNum}log.txt | awk '{print $8}')
endorsefail=$((endfail - endinit))
printf "%.2f\t" $endorsefail >> "${x}metricslog.csv"
#EndorseErrCal
printf "%.2f\t" "$(grep -o 'endorse_error'  ${x}_${ExpNum}log.txt | wc -l)" >> "${x}metricslog.csv"
#EndSigErrCal
printf "%.2f\t" "$(grep -o 'endorse_sig_error'  ${x}_${ExpNum}log.txt | wc -l)" >> "${x}metricslog.csv"
#EndDenyErrCal
printf "%.2f\t" "$(grep -o 'endorse_denied_error'  ${x}_${ExpNum}log.txt | wc -l)" >> "${x}metricslog.csv"
#TotMVCC
printf "%.2f\t" $(grep 'Total MVCC Failures' ${x}_${ExpNum}log.txt | awk '{print $9}') >> "${x}metricslog.csv"
#MVCCInter
printf "%.2f\t" $(grep 'Total Cross Block Failures' ${x}_${ExpNum}log.txt | awk '{print $10}') >> "${x}metricslog.csv"
#MVCCIntra
printf "%.2f\t" $(grep 'Total IntraBlock Failures' ${x}_${ExpNum}log.txt | awk '{print $9}') >> "${x}metricslog.csv"
#PhantomRead
printf "%.2f\t" $(grep 'Total Phantom Read Failures' ${x}_${ExpNum}log.txt | awk '{print $10}') >> "${x}metricslog.csv"
#NumOfCycles
printf "%.2f\t" $(grep 'Total totalirresolvableFailures' ${x}_${ExpNum}log.txt | awk '{print $8}') >> "${x}metricslog.csv"
#OtherFailBC
printf "%.2f\t" $(grep 'Total Other Failures' ${x}_${ExpNum}log.txt | awk '{print $9}') >> "${x}metricslog.csv"
#OtherFailNameBC
#printf "%.2f\t" $(grep 'Total Other Failures Code' ${x}_${ExpNum}log.txt | awk '{print $9}') 
printf "%.2f\t" 0 >> "${x}metricslog.csv"
#TimeoutFail 
tottx=$((l * m))
printf "%.2f\t" $((tottx - totcomm)) >> "${x}metricslog.csv"
#OrdererError
printf "%.2f\t" "$(grep -o 'ordering_error'  ${x}_${ExpNum}log.txt | wc -l)" >> "${x}metricslog.csv"
#SubmitTxError
printf "%.2f\t" "$(grep -o 'submittx_error' ${x}_${ExpNum}log.txt | wc -l)" >> "${x}metricslog.csv"
#EndRWMismatCal
printf "%.2f\t" "$(grep -o 'endorse_rwmismatch_error' ${x}_${ExpNum}log.txt | wc -l)" >> "${x}metricslog.csv"
#CommitErrCal
printf "%.2f\t" "$(grep -o 'commit_error' ${x}_${ExpNum}log.txt | wc -l)" >> "${x}metricslog.csv"
#SubmittxExpErrCal
printf "%.2f\t" "$(grep -o 'submittx_expected_error' ${x}_${ExpNum}log.txt | wc -l)" >> "${x}metricslog.csv"
if (($totcomm == 0))
then
        printf "%.2f\t" 0 >> "${x}metricslog.csv"
        printf "%.2f\t" 0 >> "${x}metricslog.csv"
        printf "%.2f\t" 0 >> "${x}metricslog.csv"
        printf "%.2f\t" 0 >> "${x}metricslog.csv"
        printf "%.2f\t" 0 >> "${x}metricslog.csv"
        printf "%.2f\t" 0 >> "${x}metricslog.csv"
else
        #AvgEndoLat
        endolat=$(grep 'endorse_latency' ${x}_${ExpNum}log.txt | awk '{print $2}' | awk '{s+=$1} END {printf "%.0f", s}')
        printf "%.2f\t" $((endolat / totcomm)) >> "${x}metricslog.csv"
        #AvgOrdSubLat
        ordsublat=$(grep 'ordering_submission_latency' ${x}_${ExpNum}log.txt | awk '{print $2}' | awk '{s+=$1} END {printf "%.0f", s}')
        printf "%.2f\t" $((ordsublat / totcomm)) >> "${x}metricslog.csv"
        #AvgOrdValLat
        ordvallat=$(grep 'orderingandvalidation_time' ${x}_${ExpNum}log.txt | awk '{print $2}' | awk '{s+=$1} END {printf "%.0f", s}')
        printf "%.2f\t" $((ordvallat / totcomm)) >> "${x}metricslog.csv"
        #AvgSuccLat
        printf "%.2f\t" $(grep '| 2    | common' ${x}_${ExpNum}log.txt | awk '{print $21}') >> "${x}metricslog.csv"
        #AvgCommLat
        commlat=$(grep 'total_transaction_time' ${x}_${ExpNum}log.txt | awk '{print $2}' | awk '{s+=$1} END {printf "%.0f", s}')
        printf "%.2f\t" $((commlat / totcomm)) >> "${x}metricslog.csv"
        #CommThrput
        totaltime=$(grep 'THROUGHPUT TIME' ${x}_${ExpNum}log.txt | awk '{print $5}')
        awk -v totcomm=$totcomm -v totaltime=$totaltime 'BEGIN {printf "%.2f\t", totcomm/totaltime}' >>  "${x}metricslog.csv"
        #printf "%.2f\t" $(grep '| 2    | common' ${x}_${ExpNum}log.txt | awk '{print $27}')
fi
#SuccThrput
printf "%.2f\t" $(grep '| 2    | common' ${x}_${ExpNum}log.txt | awk '{print $24}') >> "${x}metricslog.csv"
#BroadcastTimeout
printf "%.2f" "$(grep -o 'ordering_broadcast_timeout' ${x}_${ExpNum}log.txt | wc -l)" >> "${x}metricslog.csv"

#Delete temporary files
cp nohup.out ${x}__nohup.out
true > nohup.out
rm /home/ubuntu/HyperLedgerLab/report*
rm -rf /home/ubuntu/.ansible/tmp/
rm -rf /home/ubuntu/HyperLedgerLab/caliper/log/
rm -rf /home/ubuntu/HyperLedgerLab/log/
rm /home/ubuntu/HyperLedgerLab/ansible.log
rm -rf node_modules/

#Extract list of latencies from log file
#paste <(grep 'endorse_latency' log.txt | awk '{print $2}') >> endorselatency.txt
#paste <(grep 'ordering_submission_latency' log.txt | awk '{print $2}') >> ordering_submission_latency.txt
#paste <(grep 'orderingandvalidation_time' log.txt | awk '{print $2}') >> orderingandvalidation_time.txt
#paste <(grep 'total_transaction_time' log.txt | awk '{print $2}') >> total_transaction_time.txt

}

#This script saves formatted metrics to "${x}metricslog.csv"
#This script parses the log file "${x}_${ExpNum}log.txt" to collect the metrics

#Logical name to identify the Experiment. All results are stored to directory ExpName
ExpName='All workload'

#ExpNum iterator
ExpNum=0
x=0

#### CONTROL VARIABLES ####
#0 Experiment repeated how many times
#7 and 8 NOT COMPLETED 
for h in 2 3 
do
x=${h}
ExpNum=0

##### METRICS LOG HEADER ######
printf "sep=\t\n" >> "${x}metricslog.csv"
printf "ExpNum\tUseCase\tWorkloadType\tRWProbability\tTPS\tTxDuration\tKeyDistType\tZipSkew\tPercentHotKeys\tProbHotKeys\tBlockSize\tNumOfOrgs\tPeersPerOrg\tEndorsePolicy\tDatabase\t" >> "${x}metricslog.csv"
printf "TotTxSubmitted\tSuccTxBC\tSuccTxCal\tFailTxBC\tFailTxCal\tTotCommTxBC\tTotCommTxCal\tEndorseFailBC\tEndorseErrCal\tEndSigErrCal\tEndDenyErrCal\t" >> "${x}metricslog.csv"
printf "TotMVCC\tMVCCInter\tMVCCIntra\tPhantomRead\tNumOfCycles\tOtherFailBC\tOtherFailNameBC\tTimeoutFail\t" >> "${x}metricslog.csv"
printf "OrdererError\tSubmitTxError\tEndRWMismatCal\tCommitErrCal\tSubmittxExpErrCal\t" >> "${x}metricslog.csv"
printf "AvgEndoLat\tAvgOrdSubLat\tAvgOrdValLat\tAvgSuccLat\tAvgCommLat\tCommThrput\tSuccThrput\tBroadcastTimeoutFailure" >> "${x}metricslog.csv"

#1.UseCase values: EHR = 0, DV = 1, SCM = 2, DRM = 3
#usecase = [electronic-health-record e-voting supplychain drm]${usecase[${i}]}
for i in 4
do
  #usecase=(ehr dv scm drm)
 # cp /home/ubuntu/HyperLedgerLab/inventory/blockchain/group_vars/${usecase[${i}]}.yaml /home/ubuntu/HyperLedgerLab/inventory/blockchain/group_vars/blockchain-setup.yaml
#2.WorkloadType values: 0==Uniform, 1==ReadHeavy, 2==WriteHeavy
for j in 0 1 2 3
do
 workload=(wnorangereadheavy wnorangeinsertheavy wnorangeupdateheavy wnorangedeleteheavy)
 sed -i "55s/.*/                filearray = fs.readFileSync(__dirname + \'\/workload\/${workload[${j}]}\' + zeroPad(clientIdx, 2)).toString().split(\"\\\n\");/" inventory/blockchain/benchmark/generator/common.js
 #workload=(wnorangeuniformskew)
 #zkew=(skew0 skew1 skew2)
 #sed -i "55s/.*/                filearray = fs.readFileSync(__dirname + \'\/workload\/${zkew[${j}]}\/${workload[0]}\' + zeroPad(clientIdx, 2)).toString().split(\"\\\n\");/" inventory/blockchain/benchmark/generator/common.js
 #sed -i "69s/.*/                args = nthLine.readSync(__dirname + \'\/${workload[${j}]}_generatedtransactions.txt\', fileIndex);/" inventory/blockchain/benchmark/generator/common.js
 #sed -i "25s/.*/        let chaincodeType = ${j};/" inventory/blockchain/benchmark/generator/getParameters.js
#3.RWProbability
for k in 80
do
 sed -i "29s/.*/        let readWriteProb = ${k};/" inventory/blockchain/benchmark/generator/getParameters.js
#4.tps
for l in 100
do
 sed -i "23s/.*/        tps: ${l}/" /home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/generator/config.yaml
#5.txduration
for m in 180 
do
 sed -i "19s/.*/    - ${m}/" /home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/generator/config.yaml
#6. BlockSize
for n in 100
do
 sed -i "s/^fabric_batchsize: .*$/fabric_batchsize: [\"${n}\", \"2 MB\", \"2 MB\"]/" /home/ubuntu/HyperLedgerLab/inventory/blockchain/group_vars/blockchain-setup.yaml
#7.NumOfOrgs
for o in 8
do
 sed -i "s/^fabric_num_orgs: .*$/fabric_num_orgs: ${o}/" /home/ubuntu/HyperLedgerLab/inventory/blockchain/group_vars/blockchain-setup.yaml
#8.PeersPerOrg
for p in 4
do
 sed -i "s/^fabric_peers_per_org: .*$/fabric_peers_per_org: ${p}/" /home/ubuntu/HyperLedgerLab/inventory/blockchain/group_vars/blockchain-setup.yaml
#9.EndorsePolicy 1ofeachOrg = 0, 0org&Anyotherorg, 1-N/2orgs&N/2-Norgs
for q in 0 
do
 cp /home/ubuntu/HyperLedgerLab/hyperledger/roles/metrics_config/templates/${q}.yaml.j2 /home/ubuntu/HyperLedgerLab/hyperledger/roles/metrics_config/templates/fabric_ccp_network.yaml.j2
 
#q="1ofeachOrg"
#q=0
#10.Database values 'Z' couchdb=0 goleveldb=1
for R in goleveldb
do
 sed -i "s/^fabric_state_db: .*$/fabric_state_db: ${R}/" /home/ubuntu/HyperLedgerLab/inventory/blockchain/group_vars/blockchain-setup.yaml
 Z=1
#11.KeyDistType values: 0==zipfian, 1==hotkey
for s in 0
do
 sed -i "6s/.*/        let keyPickerType = ${s};/" inventory/blockchain/benchmark/generator/getParameters.js
if [ $s -eq 0 ]
then
 #12.ZipSkew 0==uniform, Negative==HigherValues, Positive==LowerValues
 for t in 2
 do
  sed -i "11s/.*/        let zipfianSkew = ${t};/" inventory/blockchain/benchmark/generator/getParameters.js

	#ExpNum iterator
	ExpNum=$(($ExpNum+1))
	#MetricsLog iterator
	x=${h}

	runbenchmark ${ExpNum} ${x} ${i} ${j} ${k} ${l} ${m} ${n} ${o} ${p} ${q} ${Z} ${s} ${t} 	
 done
else
 #13.PercentHotKeys
 for u in 5 10 50
 do
  sed -i "19s/.*/        let hotKeyNum = ${u};/" inventory/blockchain/benchmark/generator/getParameters.js
 #14.ProbHotKeys
 for v in 70 80 90
 do
  sed -i "15s/.*/        let hotKeyProb = ${v};/" inventory/blockchain/benchmark/generator/getParameters.js

	#ExpNum iterator
        ExpNum=$(($ExpNum+1))
	x=${h}

	runbenchmark ${ExpNum} ${x} ${i} ${j} ${k} ${l} ${m} ${n} ${o} ${p} ${q} ${Z} ${s} ${u} ${v}

 done
 done
fi
done
done
done
done
done
done
done
done
done
done
done
#Replace empty cells in log with zero
./scripts/fill-empty-values.sh ${x}metricslog.csv 0
done


#./scripts/average.py
#sudo mkdir ${ExpName} 
#sudo mv *.csv ${ExpName}/
#sudo mv *log.txt ${ExpName}/

#sudo ./scripts/generategraph.py



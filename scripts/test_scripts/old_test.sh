#!/usr/bin/env bash


runbenchmark() {

#run benchmark -- save to ${ExpNum}log.txt
#collect metrics -- save to "${x}metricslog.csv"
#copy ${ExpNum}log.txt to lap
#delete ${ExpNum}log.txt and other temporary files
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
 u="NA"
 v="NA"
else
 t="NA"
 u=${14}
 v=${15}
fi

#RUN BENCHMARK
#./scripts/run_benchmark.sh ${i} > ${ExpNum}log.txt
./scripts/run_benchmark.sh electronic-health-record > ${ExpNum}log.txt

printf "\n" >> "${x}metricslog.csv"

#printf "ExpNum\tUseCase\tWorkloadType\tRWProbability\tTPS\tTxDuration\tKeyDistType\tZipSkew\tPercentHotKeys\tProbHotKeys\tBlockSize\tNumOfOrgs\tPeersPerOrg\tEndorsePolicy\tDatabase\t" >> "${x}metricslog.csv"
printf "%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t" ${ExpNum} ${i} ${j} ${k} ${l} ${m} ${s} ${t} ${u} ${v} ${n} ${o} ${p} ${q} ${R} >> "${x}metricslog.csv"
#### COLLECT PERFORMANCE METRICS #####
#TotTxSubmitted tps*txduration
printf "%s\t" $(($l * $m)) >> "${x}metricslog.csv"
#SuccTxBC
totsucc=$(grep 'Total Tx Succeeds' ${ExpNum}log.txt | awk '{print $9}')
init=$(grep '| 1    | initLedger' ${ExpNum}log.txt | awk '{print $6}')
succ=$(($totsucc - $init))
printf "%s\t" $succ >> "${x}metricslog.csv"
#SuccTxCal
printf "%s\t" $(grep '| 2    | common' ${ExpNum}log.txt | awk '{print $6}') >> "${x}metricslog.csv"
#FailTxBC
totfail=$(grep 'Total Tx Failures =' ${ExpNum}log.txt | awk '{print $9}')
init=$(grep '| 1    | initLedger' ${ExpNum}log.txt | awk '{print $8}')
fail=$(($totfail - $init))
printf "%s\t" $fail >> "${x}metricslog.csv"
#FailTxCal
printf "%s\t" $(grep '| 2    | common' ${ExpNum}log.txt | awk '{print $8}') >> "${x}metricslog.csv"
#TotCommTxBC
totcomm=$(($succ + $fail))
printf "%s\t" $(($succ + $fail)) >> "${x}metricslog.csv"
#TotCommTxCal
printf "%s\t" $(grep '| 2    | common' ${ExpNum}log.txt | awk '{print $10}') >> "${x}metricslog.csv"
#EndorseFailBC
printf "%s\t" $(grep 'Total Endorsement Failures' ${ExpNum}log.txt | awk '{print $9}') >> "${x}metricslog.csv"
#EndorseErrCal
printf "%s\t" "$(grep -o 'endorse_error'  ${ExpNum}log.txt | wc -l)" >> "${x}metricslog.csv"
#EndSigErrCal
printf "%s\t" "$(grep -o 'endorse_sig_error'  ${ExpNum}log.txt | wc -l)" >> "${x}metricslog.csv"
#EndDenyErrCal
printf "%s\t" "$(grep -o 'endorse_denied_error'  ${ExpNum}log.txt | wc -l)" >> "${x}metricslog.csv"
#TotMVCC
printf "%s\t" $(grep 'Total MVCC Failures' ${ExpNum}log.txt | awk '{print $9}') >> "${x}metricslog.csv"
#MVCCInter
printf "%s\t" $(grep 'Total Cross Block Failures' ${ExpNum}log.txt | awk '{print $10}') >> "${x}metricslog.csv"
#MVCCIntra
printf "%s\t" $(grep 'Total IntraBlock Failures' ${ExpNum}log.txt | awk '{print $9}') >> "${x}metricslog.csv"
#PhantomRead
printf "%s\t" $(grep 'Total Phantom Read Failures' ${ExpNum}log.txt | awk '{print $10}') >> "${x}metricslog.csv"
#NumOfCycles
printf "%s\t" $(grep 'Total totalirresolvableFailures' ${ExpNum}log.txt | awk '{print $8}') >> "${x}metricslog.csv"
#OtherFailBC
printf "%s\t" $(grep 'Total Other Failures' ${ExpNum}log.txt | awk '{print $9}') >> "${x}metricslog.csv"
#OtherFailNameBC
printf "%s\t" $(grep 'Total Other Failures Code' ${ExpNum}log.txt | awk '{print $9}') >> "${x}metricslog.csv"
#TimeoutFail 
tottx=$(($l * $m))
printf "%s\t" $(($tottx - $totcomm)) >> "${x}metricslog.csv"
#OrdererError
printf "%s\t" "$(grep -o 'ordering_error'  ${ExpNum}log.txt | wc -l)" >> "${x}metricslog.csv"
#SubmitTxError
printf "%s\t" "$(grep -o 'submittx_error' ${ExpNum}log.txt | wc -l)" >> "${x}metricslog.csv"
#EndRWMismatCal
printf "%s\t" "$(grep -o 'endorse_rwmismatch_error' ${ExpNum}log.txt | wc -l)" >> "${x}metricslog.csv"
#CommitErrCal
printf "%s\t" "$(grep -o 'commit_error' ${ExpNum}log.txt | wc -l)" >> "${x}metricslog.csv"
#SubmittxExpErrCal
printf "%s\t" "$(grep -o 'submittx_expected_error' ${ExpNum}log.txt | wc -l)" >> "${x}metricslog.csv"
#AvgEndoLat
endolat=$(grep 'endorse_latency' ${ExpNum}log.txt | awk '{print $2}' | awk '{s+=$1} END {printf "%.0f", s}')
printf "%s\t" $(($endolat / $totcomm)) >> "${x}metricslog.csv"
#AvgOrdSubLat
ordsublat=$(grep 'ordering_submission_latency' ${ExpNum}log.txt | awk '{print $2}' | awk '{s+=$1} END {printf "%.0f", s}')
printf "%s\t" $(($ordsublat / $totcomm)) >> "${x}metricslog.csv"
#AvgOrdValLat
ordvallat=$(grep 'orderingandvalidation_time' ${ExpNum}log.txt | awk '{print $2}' | awk '{s+=$1} END {printf "%.0f", s}')
printf "%s\t" $(($ordvallat / $totcomm)) >> "${x}metricslog.csv"
#AvgSuccLat
printf "%s\t" $(grep '| 2    | common' ${ExpNum}log.txt | awk '{print $21}') >> "${x}metricslog.csv"
#AvgCommLat
commlat=$(grep 'total_transaction_time' ${ExpNum}log.txt | awk '{print $2}' | awk '{s+=$1} END {printf "%.0f", s}')
printf "%s\t" $(($commlat / $totcomm)) >> "${x}metricslog.csv"
#CommThrput
printf "%s\t" $(grep '| 2    | common' ${ExpNum}log.txt | awk '{print $27}') >> "${x}metricslog.csv"
#SuccThrput
printf "%s\t" $(grep '| 2    | common' ${ExpNum}log.txt | awk '{print $24}') >> "${x}metricslog.csv"
#BroadcastTimeout
printf "%s\t" "$(grep -o 'ordering_broadcast_timeout' ${ExpNum}log.txt | wc -l)" >> "${x}metricslog.csv"
#COPY ${ExpNum}log.txt to lap
#COPY "${x}metricslog.csv" to lap


#Delete temporary files
true > nohup.out
rm /home/ubuntu/hyperledgerlab-macrobenchmarks/report*
rm /home/ubuntu/hyperledgerlab-macrobenchmarks/temp*
rm -rf /home/ubuntu/.ansible/tmp/
rm -rf /home/ubuntu/hyperledgerlab-macrobenchmarks/caliper/log/
rm -rf /home/ubuntu/hyperledgerlab-macrobenchmarks/log/
rm /home/ubuntu/hyperledgerlab-macrobenchmarks/ansible.log

#Extract list of latencies from log file
#paste <(grep 'endorse_latency' log.txt | awk '{print $2}') >> endorselatency.txt
#paste <(grep 'ordering_submission_latency' log.txt | awk '{print $2}') >> ordering_submission_latency.txt
#paste <(grep 'orderingandvalidation_time' log.txt | awk '{print $2}') >> orderingandvalidation_time.txt
#paste <(grep 'total_transaction_time' log.txt | awk '{print $2}') >> total_transaction_time.txt

}

#This script saves formatted metrics to "${x}metricslog.csv"
#This script parses the log file "${ExpNum}log.txt" to collect the metrics

#ExpNum iterator
ExpNum=0
#MetricsLog file name append with current date
x=`date +%d-%m-%y`

##### METRICS LOG HEADER ######
printf "sep=\t\n" >> "${x}metricslog.csv"	
printf "ExpNum\tUseCase\tWorkloadType\tRWProbability\tTPS\tTxDuration\tKeyDistType\tZipSkew\tPercentHotKeys\tProbHotKeys\tBlockSize\tNumOfOrgs\tPeersPerOrg\tEndorsePolicy\tDatabase\t" >> "${x}metricslog.csv"
printf "TotTxSubmitted\tSuccTxBC\tSuccTxCal\tFailTxBC\tFailTxCal\tTotCommTxBC\tTotCommTxCal\tEndorseFailBC\tEndorseErrCal\tEndSigErrCal\tEndDenyErrCal\t" >> "${x}metricslog.csv"
printf "TotMVCC\tMVCCInter\tMVCCIntra\tPhantomRead\tNumOfCycles\tOtherFailBC\tOtherFailNameBC\tTimeoutFail\t" >> "${x}metricslog.csv"
printf "OrdererError\tSubmitTxError\tEndRWMismatCal\tCommitErrCal\tSubmittxExpErrCal\t" >> "${x}metricslog.csv"
printf "AvgEndoLat\tAvgOrdSubLat\tAvgOrdValLat\tAvgSuccLat\tAvgCommLat\tCommThrput\tSuccThrput\t" >> "${x}metricslog.csv"
#printf "\n" >> "${x}metricslog.csv"

#### CONTROL VARIABLES ####
#1.UseCase values: EHR, DV, SCM, DRM
#for i in EHR DV SCM DRM
#do
 #sed
i="electronic-health-record"
#2.WorkloadType values: 0==Uniform, 1==ReadHeavy, 2==WriteHeavy
for j in 0 
do
 sed -i "25s/.*/        let chaincodeType = ${j};/" inventory/blockchain/benchmark/electronic-health-record/getParameters.js
#3.RWProbability
for k in 50
do
 sed -i "29s/.*/        let readWriteProb = ${k};/" inventory/blockchain/benchmark/electronic-health-record/getParameters.js
#4.tps
for l in 100 
do
 sed -i "23s/.*/        tps: ${l}/" /home/ubuntu/hyperledgerlab-macrobenchmarks/inventory/blockchain/benchmark/electronic-health-record/config.yaml
#5.txduration
for m in 30 
do
 sed -i "19s/.*/    - ${m}/" /home/ubuntu/hyperledgerlab-macrobenchmarks/inventory/blockchain/benchmark/electronic-health-record/config.yaml
#6. BlockSize
for n in 100
do
 sed -i "s/^fabric_batchsize: .*$/fabric_batchsize: [\"${n}\", \"2 MB\", \"2 MB\"]/" /home/ubuntu/hyperledgerlab-macrobenchmarks/inventory/blockchain/group_vars/blockchain-setup.yaml
#7.NumOfOrgs
for o in 2
do
 sed -i "s/^fabric_num_orgs: .*$/fabric_num_orgs: ${o}/" /home/ubuntu/hyperledgerlab-macrobenchmarks/inventory/blockchain/group_vars/blockchain-setup.yaml
#8.PeersPerOrg
for p in 2
do
 sed -i "s/^fabric_peers_per_org: .*$/fabric_peers_per_org: ${p}/" /home/ubuntu/hyperledgerlab-macrobenchmarks/inventory/blockchain/group_vars/blockchain-setup.yaml
#9.EndorsePolicy
#for q
#do
q="1ofeachOrg"
#10.Database values couchdb goleveldb
for R in couchdb
do
 sed -i "s/^fabric_state_db: .*$/fabric_state_db: ${R}/" /home/ubuntu/hyperledgerlab-macrobenchmarks/inventory/blockchain/group_vars/blockchain-setup.yaml
#11.KeyDistType values: 0==zipfian, 1==hotkey
for s in 0
do
 sed -i "6s/.*/        let keyPickerType = ${s};/" inventory/blockchain/benchmark/electronic-health-record/getParameters.js
if [ $s -eq 0 ]
then
 #12.ZipSkew 0==uniform, Negative==HigherValues, Positive==LowerValues
 for t in 0
 do
  sed -i "11s/.*/        let zipfianSkew = ${t};/" inventory/blockchain/benchmark/electronic-health-record/getParameters.js

	#ExpNum iterator
	ExpNum=$(($ExpNum+1))
	#MetricsLog iterator
	x=`date +%d-%m-%y`
	#x=$(($x+1))

      if [ $ExpNum -eq 1 ]
      then
       olddate=${x}
       fi
       if [ ${x} != ${olddate} ]
       then
       olddate=${x}
        ##### METRICS LOG HEADER ######
        printf "sep=\t\n" >> "${x}metricslog.csv"
    printf "ExpNum\tUseCase\tWorkloadType\tRWProbability\tTPS\tTxDuration\tKeyDistType\tZipSkew\tPercentHotKeys\tProbHotKeys\tBlockSize\tNumOfOrgs\tPeersPerOrg\tEndorsePolicy\tDatabase\t" >> "${x}metricslog.csv"
    printf "TotTxSubmitted\tSuccTxBC\tSuccTxCal\tFailTxBC\tFailTxCal\tTotCommTxBC\tTotCommTxCal\tEndorseFailBC\tEndorseErrCal\tEndSigErrCal\tEndDenyErrCal\t" >> "${x}metricslog.csv"
    printf "TotMVCC\tMVCCInter\tMVCCIntra\tPhantomRead\tNumOfCycles\tOtherFailBC\tOtherFailNameBC\tTimeoutFail\t" >> "${x}metricslog.csv"
    printf "OrdererError\tSubmitTxError\tEndRWMismatCal\tCommitErrCal\tSubmittxExpErrCal\t" >> "${x}metricslog.csv"
    printf "AvgEndoLat\tAvgOrdSubLat\tAvgOrdValLat\tAvgSuccLat\tAvgCommLat\tCommThrput\tSuccThrput\t" >> "${x}metricslog.csv"
    fi


	runbenchmark ${ExpNum} ${x} ${i} ${j} ${k} ${l} ${m} ${n} ${o} ${p} ${q} ${R} ${s} ${t} 	
 done
else
 #13.PercentHotKeys
 for u in 5 10 50
 do
  sed -i "19s/.*/        let hotKeyNum = ${u};/" inventory/blockchain/benchmark/electronic-health-record/getParameters.js
 #14.ProbHotKeys
 for v in 70 80 90
 do
  sed -i "15s/.*/        let hotKeyProb = ${v};/" inventory/blockchain/benchmark/electronic-health-record/getParameters.js

	#ExpNum iterator
        ExpNum=$(($ExpNum+1))
        #MetricsLog iterator
        x=`date +%d-%m-%y`
        #x=$(($x+1))

     if [ $ExpNum -eq 1 ]
      then
       olddate=${x}
       fi
       if [ ${x} != ${olddate} ]
       then
       olddate=${x}
        ##### METRICS LOG HEADER ######
        printf "sep=\t\n" >> "${x}metricslog.csv"
    printf "ExpNum\tUseCase\tWorkloadType\tRWProbability\tTPS\tTxDuration\tKeyDistType\tZipSkew\tPercentHotKeys\tProbHotKeys\tBlockSize\tNumOfOrgs\tPeersPerOrg\tEndorsePolicy\tDatabase\t" >> "${x}metricslog.csv"
    printf "TotTxSubmitted\tSuccTxBC\tSuccTxCal\tFailTxBC\tFailTxCal\tTotCommTxBC\tTotCommTxCal\tEndorseFailBC\tEndorseErrCal\tEndSigErrCal\tEndDenyErrCal\t" >> "${x}metricslog.csv"
    printf "TotMVCC\tMVCCInter\tMVCCIntra\tPhantomRead\tNumOfCycles\tOtherFailBC\tOtherFailNameBC\tTimeoutFail\t" >> "${x}metricslog.csv"
    printf "OrdererError\tSubmitTxError\tEndRWMismatCal\tCommitErrCal\tSubmittxExpErrCal\t" >> "${x}metricslog.csv"
    printf "AvgEndoLat\tAvgOrdSubLat\tAvgOrdValLat\tAvgSuccLat\tAvgCommLat\tCommThrput\tSuccThrput\t" >> "${x}metricslog.csv"
    fi



	runbenchmark ${ExpNum} ${x} ${i} ${j} ${k} ${l} ${m} ${n} ${o} ${p} ${q} ${R} ${s} ${u} ${v}

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
#done
#done


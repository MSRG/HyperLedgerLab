#!/bin/bash

x=3
ExpNum=2
l=100
m=180
#TotTxSubmitted tps*txduration
printf "%.2f\t" $(($l * $m)) >> "${x}metricslog.csv"
#SuccTxBC
totsucc=$(grep 'Total Tx Succeeds' ${x}_${ExpNum}log.txt | awk '{print $9}')
init=$(grep '| 1    | initLedger' ${x}_${ExpNum}log.txt | awk '{print $6}')
succ=$(($totsucc - $init))
printf "%.2f\t" $succ >> "${x}metricslog.csv"
#SuccTxCal
printf "%.2f\t" $(grep '| 2    | common' ${x}_${ExpNum}log.txt | awk '{print $6}') >> "${x}metricslog.csv"
#FailTxBC
totfail=$(grep 'Total Tx Failures =' ${x}_${ExpNum}log.txt | awk '{print $9}')
init=$(grep '| 1    | initLedger' ${x}_${ExpNum}log.txt | awk '{print $8}')
fail=$(($totfail - $init))
printf "%.2f\t" $fail >> "${x}metricslog.csv"
#FailTxCal
printf "%.2f\t" $(grep '| 2    | common' ${x}_${ExpNum}log.txt | awk '{print $8}') >> "${x}metricslog.csv"
#TotCommTxBC
totcomm=$(($succ + $fail))
printf "%.2f\t" $(($succ + $fail)) >> "${x}metricslog.csv"
#TotCommTxCal
printf "%.2f\t" $(grep '| 2    | common' ${x}_${ExpNum}log.txt | awk '{print $10}') >> "${x}metricslog.csv"
#EndorseFailBC
printf "%.2f\t" $(grep 'Total Endorsement Failures' ${x}_${ExpNum}log.txt | awk '{print $9}') >> "${x}metricslog.csv"
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
#printf "%.2f\t" $(grep 'Total Other Failures Code' ${x}_${ExpNum}log.txt | awk '{print $9}') >> "${x}metricslog.csv"
printf "%.2f\t" 0 >> "${x}metricslog.csv"
#TimeoutFail 
tottx=$(($l * $m))
printf "%.2f\t" $(($tottx - $totcomm)) >> "${x}metricslog.csv"
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
#AvgEndoLat
endolat=$(grep 'endorse_latency' ${x}_${ExpNum}log.txt | awk '{print $2}' | awk '{s+=$1} END {printf "%.0f", s}')
printf "%.2f\t" $(($endolat / $totcomm)) >> "${x}metricslog.csv"
#AvgOrdSubLat
ordsublat=$(grep 'ordering_submission_latency' ${x}_${ExpNum}log.txt | awk '{print $2}' | awk '{s+=$1} END {printf "%.0f", s}')
printf "%.2f\t" $(($ordsublat / $totcomm)) >> "${x}metricslog.csv"
#AvgOrdValLat
ordvallat=$(grep 'orderingandvalidation_time' ${x}_${ExpNum}log.txt | awk '{print $2}' | awk '{s+=$1} END {printf "%.0f", s}')
printf "%.2f\t" $(($ordvallat / $totcomm)) >> "${x}metricslog.csv"
#AvgSuccLat
printf "%.2f\t" $(grep '| 2    | common' ${x}_${ExpNum}log.txt | awk '{print $21}') >> "${x}metricslog.csv"
#AvgCommLat
commlat=$(grep 'total_transaction_time' ${x}_${ExpNum}log.txt | awk '{print $2}' | awk '{s+=$1} END {printf "%.0f", s}')
printf "%.2f\t" $(($commlat / $totcomm)) >> "${x}metricslog.csv"
#CommThrput
printf "%.2f\t" $(grep '| 2    | common' ${x}_${ExpNum}log.txt | awk '{print $27}') >> "${x}metricslog.csv"
#SuccThrput
printf "%.2f\t" $(grep '| 2    | common' ${x}_${ExpNum}log.txt | awk '{print $24}') >> "${x}metricslog.csv"
#BroadcastTimeout
printf "%.2f" "$(grep -o 'ordering_broadcast_timeout' ${x}_${ExpNum}log.txt | wc -l)" >> "${x}metricslog.csv"


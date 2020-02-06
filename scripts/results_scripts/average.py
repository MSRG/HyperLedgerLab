#!/usr/bin/env python
import numpy as np
import pandas as pd

files = ["1metricslog.csv", "2metricslog.csv", "3metricslog.csv", "4metricslog.csv", "5metricslog.csv"]
#files = ["1metricslog.csv", "2metricslog.csv", "3metricslog.csv", "4metricslog.csv", "5metricslog.csv", "6metricslog.csv", "7metricslog.csv", "8metricslog.csv", "9metricslog.csv", "10metricslog.csv"]
for num, filename in enumerate(files, 1):
	print filename
	dftemp = pd.read_csv(filename, delimiter='\t', skiprows=1)
	dftemp['failTxPercent'] = (dftemp['FailTxBC']/dftemp['TotCommTxBC'])*100
	dftemp['succTxPercent'] = (dftemp['SuccTxBC']/dftemp['TotCommTxBC'])*100
	dftemp['EndorseFailBCPercent'] = (dftemp['EndorseFailBC']/dftemp['TotCommTxBC'])*100
	dftemp['TotMVCCPercent'] = (dftemp['TotMVCC']/dftemp['TotCommTxBC'])*100
	dftemp['MVCCInterPercent'] = (dftemp['MVCCInter']/dftemp['TotCommTxBC'])*100
	dftemp['MVCCIntraPercent'] = (dftemp['MVCCIntra']/dftemp['TotCommTxBC'])*100
	dftemp['PhantomReadPercent'] = (dftemp['PhantomRead']/dftemp['TotCommTxBC'])*100
	dftemp['OtherFailBCPercent'] = (dftemp['OtherFailBC']/dftemp['TotCommTxBC'])*100
	dftemp['AvgEndoLat'] = dftemp['AvgEndoLat']/1000
	dftemp['AvgOrdValLat'] = dftemp['AvgOrdValLat']/1000
	dftemp['AvgCommLat'] = dftemp['AvgCommLat']/1000

	dftemp.to_csv('%dfinalmetricslog.csv' % num , mode='a', float_format='%.2f')

#Average of all values from different metrics log
f1=open('./average_metricslog.csv', 'ab')
f1.write('ExpNum,UseCase,WorkloadType,RWProbability,TPS,TxDuration,KeyDistType,ZipSkew,PercentHotKeys,ProbHotKeys,BlockSize,NumOfOrgs,PeersPerOrg,EndorsePolicy,Database,TotTxSubmitted,SuccTxBC,SuccTxCal,FailTxBC,FailTxCal,TotCommTxBC,TotCommTxCal,EndorseFailBC,EndorseErrCal,EndSigErrCal,EndDenyErrCal,TotMVCC,MVCCInter,MVCCIntra,PhantomRead,NumOfCycles,OtherFailBC,OtherFailNameBC,TimeoutFail,OrdererError,SubmitTxError,EndRWMismatCal,CommitErrCal,SubmittxExpErrCal,AvgEndoLat,AvgOrdSubLat,AvgOrdValLat,AvgSuccLat,AvgCommLat,CommThrput,SuccThrput,BroadcastTimeoutFailure,failTxPercent,succTxPercent,EndorseFailBCPercent,TotMVCCPercent,MVCCInterPercent,MVCCIntraPercent,PhantomReadPercent,OtherFailBCPercent\n')


f2=open('./stderr_metricslog.csv', 'ab')
f2.write('ExpNumStdErr,UseCaseStdErr,WorkloadTypeStdErr,RWProbabilityStdErr,TPSStdErr,TxDurationStdErr,KeyDistTypeStdErr,ZipSkewStdErr,PercentHotKeysStdErr,ProbHotKeysStdErr,BlockSizeStdErr,NumOfOrgsStdErr,PeersPerOrgStdErr,EndorsePolicyStdErr,DatabaseStdErr,TotTxSubmittedStdErr,SuccTxBCStdErr,SuccTxCalStdErr,FailTxBCStdErr,FailTxCalStdErr,TotCommTxBCStdErr,TotCommTxCalStdErr,EndorseFailBCStdErr,EndorseErrCalStdErr,EndSigErrCalStdErr,EndDenyErrCalStdErr,TotMVCC,MVCCInterStdErr,MVCCIntraStdErr,PhantomReadStdErr,NumOfCyclesStdErr,OtherFailBCStdErr,OtherFailNameBCStdErr,TimeoutFailStdErr,OrdererErrorStdErr,SubmitTxErrorStdErr,EndRWMismatCalStdErr,CommitErrCalStdErr,SubmittxExpErrCalStdErr,AvgEndoLatStdErr,AvgOrdSubLatStdErr,AvgOrdValLatStdErr,AvgSuccLatStdErr,AvgCommLatStdErr,CommThrputStdErr,SuccThrputStdErr,BroadcastTimeoutFailureStdErr,failTxPercentStdErr,succTxPercentStdErr,EndorseFailBCPercentStdErr,TotMVCCPercentStdErr,MVCCInterPercentStdErr,MVCCIntraPercentStdErr,PhantomReadPercentStdErr,OtherFailBCPercentStdErr\n')

files = ["1finalmetricslog.csv", "2finalmetricslog.csv", "3finalmetricslog.csv", "4finalmetricslog.csv", "5finalmetricslog.csv"]
#files = ["1finalmetricslog.csv", "2finalmetricslog.csv", "3finalmetricslog.csv", "4finalmetricslog.csv", "5finalmetricslog.csv", "6finalmetricslog.csv", "7finalmetricslog.csv", "8finalmetricslog.csv", "9finalmetricslog.csv", "10finalmetricslog.csv"]

float_formatter = lambda x: "%.2f" % x
np.set_printoptions(formatter={'float_kind':float_formatter})

vals = None
for num, filename in enumerate(files, 1):
    print filename
    arr = np.genfromtxt(filename, dtype=float, delimiter=',', skip_header=1 )
    print arr
    if vals is None:
        vals = arr
    else:
        vals += arr

meanvals = vals / num

newvals = None
for num, filename in enumerate(files, 1):
	arr = np.genfromtxt(filename, dtype=float, delimiter=',', skip_header=1 )
	if newvals is None:
		newvals = (arr - meanvals)**2
	else:
		newvals += (arr - meanvals)**2
stddev = np.sqrt(newvals/(num-1))
stderror = stddev/np.sqrt(num)

print stderror

np.savetxt(f1, meanvals, delimiter=",", fmt='%.2f')
f1.close() 

np.savetxt(f2, stderror, delimiter=",", fmt='%.2f')
f2.close() 

df = pd.read_csv('average_metricslog.csv', delimiter=',')
dfstd = pd.read_csv('stderr_metricslog.csv', delimiter=',')

df = df.reset_index(drop=True)
dfstd = dfstd.reset_index(drop=True)

df['failTxPercentSE'] = dfstd['failTxPercentStdErr']
df['succTxPercentSE'] = dfstd['succTxPercentStdErr']
df['EndorseFailBCPercentSE'] = dfstd['EndorseFailBCPercentStdErr']
df['TotMVCCPercentSE'] = dfstd['TotMVCCPercentStdErr']
df['MVCCInterPercentSE'] = dfstd['MVCCInterPercentStdErr']
df['MVCCIntraPercentSE'] = dfstd['MVCCIntraPercentStdErr']
df['PhantomReadPercentSE'] = dfstd['PhantomReadPercentStdErr']
df['OtherFailBCPercentSE'] = dfstd['OtherFailBCPercentStdErr']
df['AvgEndoLatSE'] = dfstd['AvgEndoLatStdErr']
df['AvgOrdValLatSE'] = dfstd['AvgOrdValLatStdErr']
df['AvgSuccLatSE'] = dfstd['AvgSuccLatStdErr']
df['AvgCommLatSE'] = dfstd['AvgCommLatStdErr']
df['CommThrputSE'] = dfstd['CommThrputStdErr']
df['SuccThrputSE'] = dfstd['SuccThrputStdErr']


#Final metrics log which contains average and standard error
f1=open('./final_metrics_log.csv', 'w+')
f1.write('sep=,\n')
f1.close()

df.to_csv('final_metrics_log.csv', mode='a', float_format='%.2f')


#Selected metrics log which contains selected columns required for graph generation
f1=open('./selected_metrics_log.csv', 'w+')
f1.write('sep=,\n')
f1.close()

selectedcolumns =[ 'ExpNum', 'UseCase' , 'WorkloadType', 'RWProbability', 'TPS', 'TxDuration', 'KeyDistType', 'ZipSkew', 'PercentHotKeys', 'ProbHotKeys', 'BlockSize', 'NumOfOrgs', 'PeersPerOrg', 'EndorsePolicy', 'Database', 'succTxPercent', 'failTxPercent', 'TotCommTxBC', 'EndorseFailBCPercent', 'TotMVCCPercent', 'MVCCInterPercent', 'MVCCIntraPercent', 'PhantomReadPercent', 'NumOfCycles', 'OtherFailBCPercent', 'AvgEndoLat', 'AvgOrdValLat', 'AvgSuccLat', 'AvgCommLat', 'CommThrput', 'SuccThrput', 'failTxPercentSE', 'succTxPercentSE', 'EndorseFailBCPercentSE', 'TotMVCCPercentSE', 'MVCCInterPercentSE', 'MVCCIntraPercentSE', 'PhantomReadPercentSE', 'OtherFailBCPercentSE', 'AvgEndoLatSE', 'AvgOrdValLatSE', 'AvgSuccLatSE', 'AvgCommLatSE', 'CommThrputSE', 'SuccThrputSE']
selectedcol =[x for x in df.columns if x in selectedcolumns]
selectedcoltowrite = df[selectedcol]
selectedcoltowrite.to_csv('selected_metrics_log.csv', mode='a', float_format='%.2f')

#Generate graphs
#dfgraph = pd.read_csv('selected_metrics_log.csv', delimiter=',')
#dffilter = dfgraph[dfgraph['TPS'] == 100]
#fig = px.bar(dffilter, x = 'BlockSize', y = 'failTxPercent', title='BlockSize Vs failTxPercent at TPS = 100')
#fig.show()

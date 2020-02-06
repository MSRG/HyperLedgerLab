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


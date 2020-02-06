#!/usr/bin/env python
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import os
import numpy as np

ExpName='avg_graph'

#Generate graphs
dfgraph = pd.read_csv('./%s/selected_metrics_log.csv' % ExpName, delimiter=',', skiprows=1)
dfgraph = dfgraph.reset_index(drop=True)

#Generate graphs for each tps value
yvalues = ['succTxPercent', 'failTxPercent', 'TotMVCCPercent', 'MVCCInterPercent', 'MVCCIntraPercent', 'PhantomReadPercent', 'EndorseFailBCPercent', 'AvgEndoLat', 'AvgOrdValLat', 'AvgSuccLat', 'CommThrput', 'SuccThrput']
for tps in dfgraph['UseCase'].unique():
	for y in yvalues: 
		dffilter = dfgraph[dfgraph['UseCase'] == tps]
		dffilter = dffilter.reset_index(drop=True)	
		plotname = 'BlockSize_Vs_'+ str(y) + '_at_' + str(int(tps)) + 'UseCase'
		plt.bar(dffilter['BlockSize'], dffilter[y], yerr=dffilter[y+'SE'], width=30, color='blue', edgecolor='blue', ecolor='black')
		plt.xlabel("BlockSize")
		plt.ylabel(y)
		plt.title(plotname)
		plt.legend()
		plt.ylim(bottom=0)
		plt.xlim(left=0)
		#plt.xticks(dffilter['BlockSize'])
		
		#Directory name same as ExpName in scripts/test.sh
		try:
			os.makedirs("./%s/PerUseCase/%d" % (ExpName, tps))
		except OSError as err:
	   		print(err)
		plt.savefig('./%s/PerUseCase/%d/%s.png' % (ExpName, tps, plotname))
		plt.close()
	

#Generate graphs for each blocksize value
yvalues = ['succTxPercent', 'failTxPercent', 'TotMVCCPercent', 'MVCCInterPercent', 'MVCCIntraPercent', 'PhantomReadPercent', 'EndorseFailBCPercent', 'AvgEndoLat', 'AvgOrdValLat', 'AvgSuccLat', 'CommThrput', 'SuccThrput']
for bs in dfgraph['BlockSize'].unique():
        for y in yvalues:
                dffilter = dfgraph[dfgraph['BlockSize'] == bs]
                dffilter = dffilter.reset_index(drop=True)
                plotname = 'UseCase_Vs_'+ str(y) + '_at_' + str(int(bs)) + '_Blocksize'
                plt.bar(dffilter['UseCase'], dffilter[y], yerr=dffilter[y+'SE'], width=0.5, color='blue', edgecolor='blue', ecolor='black')
                plt.xlabel("UseCase")
                plt.ylabel(y)
                plt.title(plotname)
                plt.legend()
                plt.ylim(bottom=0)
                plt.xlim(left=0)
                #plt.xticks(dffilter['BlockSize'])

                #Directory name same as ExpName in scripts/test.sh
                try:
                        os.makedirs("./%s/PerBlocksize/%d" % (ExpName, bs))
                except OSError as err:
                        print(err)
                plt.savefig('./%s/PerBlocksize/%d/%s.png' % (ExpName, bs, plotname))
                plt.close()





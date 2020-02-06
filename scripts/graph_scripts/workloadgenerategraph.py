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

#Generate graphs
yvalues = ['succTxPercent', 'failTxPercent', 'TotMVCCPercent', 'MVCCInterPercent', 'MVCCIntraPercent', 'PhantomReadPercent', 'EndorseFailBCPercent', 'AvgEndoLat', 'AvgOrdValLat', 'AvgSuccLat', 'CommThrput', 'SuccThrput']
for w in dfgraph['WorkloadType'].unique():
		for bs in dfgraph['BlockSize'].unique():
			for y in yvalues: 
			 	 dffilter = dfgraph[(dfgraph['BlockSize'] == bs) & (dfgraph['WorkloadType'] == w)]
				 dffilter = dffilter.reset_index(drop=True)	
				 plotname = 'ZipSkew_Vs_'+ str(y) + '_at_' + str(int(bs)) + '_BSize' + str(int(w)) + '_Workload' 
				 plt.bar(dffilter['ZipSkew'], dffilter[y], yerr=dffilter[y+'SE'], color='blue', edgecolor='blue', ecolor='black', width=0.5)
				 plt.xlabel("ZipSkew")
		  		 plt.ylabel(y)
				 plt.xticks(dffilter['ZipSkew'])
				 plt.title(plotname)
				 plt.legend()
				 plt.ylim(bottom=0)
		 		 plt.xlim(0,len(dffilter['ZipSkew']))
		
				 #Directory name same as ExpName in scripts/test.sh
				 try:
					os.makedirs("./%s/ZipSkew/" % (ExpName))
				 except OSError as err:
	   				print(err)
				 plt.savefig('./%s/ZipSkew/%s.png' % (ExpName, plotname))
				 plt.close()
				 plt.clf()
	

for z in dfgraph['ZipSkew'].unique():
	for w in dfgraph['WorkloadType'].unique():
        	for y in yvalues:
                	dffilter = dfgraph[(dfgraph['ZipSkew'] == z) & (dfgraph['WorkloadType'] == w)]
                        dffilter = dffilter.reset_index(drop=True)
                        plotname = 'BSize_Vs_'+ str(y) + '_at_' + str(int(z)) + '_ZipSkew' + str(int(w)) + '_Workload'
                        plt.bar(dffilter['BlockSize'], dffilter[y], yerr=dffilter[y+'SE'], width=3, color='blue', edgecolor='blue', ecolor='black')
                        plt.xlabel("BlockSize")
                        plt.ylabel(y)
			plt.xticks(dffilter['BlockSize'])
                        plt.title(plotname)
                        plt.legend()
                        plt.ylim(bottom=0)
                        #plt.xlim(0, len(dffilter['BlockSize']))
                        plt.xlim(left=0)
                        #Directory name same as ExpName in scripts/test.sh
                        try:
 	                       os.makedirs("./%s/BlockSize/" % (ExpName))
                        except OSError as err:
         	               print(err)
                        plt.savefig('./%s/BlockSize/%s.png' % (ExpName, plotname))
                        plt.close()
			plt.clf()


for bs in dfgraph['BlockSize'].unique():
	for z in dfgraph['ZipSkew'].unique():
                        for y in yvalues:
                                 dffilter = dfgraph[(dfgraph['ZipSkew'] == z) & (dfgraph['BlockSize'] == bs)]
                                 dffilter = dffilter.reset_index(drop=True)
                                 plotname = 'Workload_Vs_'+ str(y) + '_at_' + str(int(z)) + '_ZipSkew' + str(int(bs)) + '_BSize'
                                 plt.bar(dffilter['WorkloadType'], dffilter[y], yerr=dffilter[y+'SE'], width=0.5, color='blue', edgecolor='blue', ecolor='black')
                                 plt.xlabel("WorkloadType")
                                 plt.ylabel(y)
				 plt.xticks(dffilter['WorkloadType'])
                                 plt.title(plotname)
                                 plt.legend()
                                 plt.ylim(bottom=0)
                                 plt.xlim(0, len(dffilter['WorkloadType']))

                                 #Directory name same as ExpName in scripts/test.sh
                                 try:
                                        os.makedirs("./%s/WorkloadType/" % (ExpName))
                                 except OSError as err:
                                        print(err)
                                 plt.savefig('./%s/WorkloadType/%s.png' % (ExpName, plotname))
                                 plt.close()
				 plt.clf()


#!/usr/bin/env python
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import os
import numpy as np

ExpName='streamchain_workload'

#Generate graphs
dfgraph = pd.read_csv('./%s/selected_metrics_log.csv' % ExpName, delimiter=',', skiprows=1)
dfgraph = dfgraph.reset_index(drop=True)

#Generate graphs
yvalues = ['succTxPercent', 'failTxPercent', 'TotMVCCPercent', 'MVCCInterPercent', 'MVCCIntraPercent', 'PhantomReadPercent', 'EndorseFailBCPercent', 'AvgEndoLat', 'AvgOrdValLat', 'AvgSuccLat', 'CommThrput', 'SuccThrput']
for o in dfgraph['NumOfOrgs'].unique():
	for p in dfgraph['PeersPerOrg'].unique():
			for y in yvalues: 
			 	 dffilter = dfgraph[(dfgraph['NumOfOrgs'] == o) & (dfgraph['PeersPerOrg'] == p)]
				 dffilter = dffilter.reset_index(drop=True)	
				 plotname = 'Blocksize_Vs_'+ str(y) + '_at_' + str(int(p)) + '_PeersPerOrg' + str(int(o)) + '_Orgs'
				 plt.bar(dffilter['BlockSize'], dffilter[y], yerr=dffilter[y+'SE'], color='blue', edgecolor='blue', ecolor='black', width=0.5)
				 plt.xlabel("BlockSize")
		  		 plt.ylabel(y)
				 plt.xticks(dffilter['BlockSize'])
				 plt.title(plotname)
				 plt.legend()
				 plt.ylim(bottom=0)
		 		 plt.xlim(0,len(dffilter['BlockSize']))
		
				 #Directory name same as ExpName in scripts/test.sh
				 try:
					os.makedirs("./%s/BlockSize/" % (ExpName))
				 except OSError as err:
	   				print(err)
				 plt.savefig('./%s/BlockSize/%s.png' % (ExpName, plotname))
				 plt.close()
				 plt.clf()
	

for bs in dfgraph['BlockSize'].unique():
	for o in dfgraph['NumOfOrgs'].unique():
                        for y in yvalues:
                                 dffilter = dfgraph[(dfgraph['NumOfOrgs'] == o) & (dfgraph['BlockSize'] == bs)]
                                 dffilter = dffilter.reset_index(drop=True)
                                 plotname = 'PeersPerOrg_Vs_'+ str(y) + '_at_' + str(int(bs)) + '_BlockSize' + str(int(o)) + '_Orgs'
                                 plt.bar(dffilter['PeersPerOrg'], dffilter[y], yerr=dffilter[y+'SE'], color='blue', edgecolor='blue', ecolor='black', width=0.5)
                                 plt.xlabel("PeersPerOrg")
                                 plt.ylabel(y)
                                 plt.xticks(dffilter['PeersPerOrg'])
                                 plt.title(plotname)
                                 plt.legend()
                                 plt.ylim(bottom=0)
                                 plt.xlim(0,len(dffilter['PeersPerOrg']))

                                 #Directory name same as ExpName in scripts/test.sh
                                 try:
                                        os.makedirs("./%s/PeersPerOrg/" % (ExpName))
                                 except OSError as err:
                                        print(err)
                                 plt.savefig('./%s/PeersPerOrg/%s.png' % (ExpName, plotname))
                                 plt.close()
                                 plt.clf()


for p in dfgraph['PeersPerOrg'].unique():
	for bs in dfgraph['BlockSize'].unique():
		for y in yvalues:
                                 dffilter = dfgraph[(dfgraph['PeersPerOrg'] == p) & (dfgraph['BlockSize'] == bs)]
                                 dffilter = dffilter.reset_index(drop=True)
                                 plotname = 'NumOfOrgs_Vs_'+ str(y) + '_at_' + str(int(bs)) + '_BlockSize' + str(int(p)) + '_PeersPerOrg'
                                 plt.bar(dffilter['NumOfOrgs'], dffilter[y], yerr=dffilter[y+'SE'], color='blue', edgecolor='blue', ecolor='black', width=0.5)
                                 plt.xlabel("NumOfOrgs")
                                 plt.ylabel(y)
                                 plt.xticks(dffilter['NumOfOrgs'])
                                 plt.title(plotname)
                                 plt.legend()
                                 plt.ylim(bottom=0)
                                 plt.xlim(0,len(dffilter['NumOfOrgs']))

                                 #Directory name same as ExpName in scripts/test.sh
                                 try:
                                        os.makedirs("./%s/NumOfOrgs/" % (ExpName))
                                 except OSError as err:
                                        print(err)
                                 plt.savefig('./%s/NumOfOrgs/%s.png' % (ExpName, plotname))
                                 plt.close()
                                 plt.clf()


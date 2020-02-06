#!/usr/bin/env python
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import os
import numpy as np

ExpName='avg_graph'

f1=open('./%s/bestblocksizemin.csv' % ExpName, 'ab')
f1.write('NumOfOrgs,failTxPercent,TotMVCCPercent,MVCCInterPercent,MVCCIntraPercent,PhantomReadPercent,EndorseFailBCPercent,AvgSuccLat,\n')

#Generate graphs
dfgraph = pd.read_csv('./%s/selected_metrics_log.csv' % ExpName, delimiter=',', skiprows=1)
dfgraph = dfgraph.reset_index(drop=True)

#Generate graphs for each tps value
yvalues = ['failTxPercent', 'TotMVCCPercent', 'MVCCInterPercent', 'MVCCIntraPercent', 'PhantomReadPercent', 'EndorseFailBCPercent', 'AvgSuccLat']

for tps in dfgraph['NumOfOrgs'].unique():
	f1.write(repr(tps))
	f1.write(',')
        for y in yvalues:
		dffilter = dfgraph[dfgraph['NumOfOrgs'] == tps]
		#print(dffilter)
		minindex=dffilter[y].idxmin()
		#print(minindex)
		bestbs=dffilter.loc[minindex, 'BlockSize']
		#print(bestbs)
		f1.write(repr(bestbs))
		f1.write(',')
	f1.write('\n')

f1.close()
f1=open('./%s/bestblocksizemax.csv' % ExpName, 'ab')
f1.write('NumOfOrgs,succTxPercent,CommThrput,SuccThrput,\n')
yvalues = ['succTxPercent', 'CommThrput', 'SuccThrput']

for tps in dfgraph['NumOfOrgs'].unique():
	f1.write(repr(tps))
        f1.write(',')
        for y in yvalues:
                dffilter = dfgraph[dfgraph['NumOfOrgs'] == tps]
                maxindex=dffilter[y].idxmax()
                bestbs=dffilter.loc[maxindex, 'BlockSize']
                f1.write(repr(bestbs))
                f1.write(',')
	f1.write('\n')

f1.close()


#GenerateGraphs
dfgraph = pd.read_csv('./%s/bestblocksizemin.csv' % ExpName, delimiter=',')
dfgraph = dfgraph.reset_index(drop=True)
yvalues = ['failTxPercent', 'TotMVCCPercent', 'MVCCInterPercent', 'MVCCIntraPercent', 'PhantomReadPercent', 'EndorseFailBCPercent', 'AvgSuccLat']

try:
	os.makedirs("./%s/bestbs" % (ExpName))
except OSError as err:
	print(err)

for y in yvalues:
	plotname = 'BestBlockSizeVsNumOfOrgs_Min'+ str(y)
	plt.bar(dfgraph['NumOfOrgs'], dfgraph[y], width=0.5, color='blue', edgecolor='blue', ecolor='black')
	plt.xlabel("NumOfOrgs")
	plt.ylabel("BlockSize")
	plt.xticks(dfgraph['NumOfOrgs'])
	print(dfgraph['NumOfOrgs'])
	plt.title(plotname)
	plt.legend()
        plt.ylim(bottom=0)
        #plt.xlim(0, len(dfgraph['TPS']))
	print(len(dfgraph['NumOfOrgs']))
	plt.savefig('./%s/bestbs/%s.png' % (ExpName, plotname))
        plt.close()
	plt.clf()

dfgraph = pd.read_csv('./%s/bestblocksizemax.csv' % ExpName, delimiter=',')
dfgraph = dfgraph.reset_index(drop=True)
yvalues = ['succTxPercent', 'CommThrput', 'SuccThrput']

for y in yvalues:
        plotname = 'BestBlockSizeVsNumOfOrgs_Max'+ str(y)
        plt.bar(dfgraph['NumOfOrgs'], dfgraph[y], width=0.5, color='blue', edgecolor='blue', ecolor='black')
        plt.xlabel("NumOfOrgs")
        plt.ylabel("BlockSize")
        plt.xticks(dfgraph['NumOfOrgs'])
        plt.title(plotname)
        plt.legend()
        plt.ylim(bottom=0)
        #plt.xlim(0, len(dfgraph['TPS']))
        plt.savefig('./%s/bestbs/%s.png' % (ExpName, plotname))
        plt.close()
	plt.clf()



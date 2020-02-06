#!/usr/bin/env python
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import os
import numpy as np

#ExpName='EHRtpsandbs'

#Generate graphs
dfgraph = pd.read_csv('selected_metrics_log.csv', delimiter=',', skiprows=1)
dfgraph = dfgraph.reset_index(drop=True)

#Generate graphs for each tps value
yvalues = ['ActualCommThrput']
for tps in dfgraph['TPS']:
	for y in yvalues: 
		dffilter = dfgraph[dfgraph['TPS'] == tps]
		dffilter = dffilter.reset_index(drop=True)	
		plotname = 'BlockSize_Vs_'+ str(y) + '_at_' + str(int(tps)) + '_TPS'
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
			os.makedirs("./PerTps/%d" % (tps))
		except OSError as err:
	   		print(err)
		plt.savefig('./PerTps/%d/%s.png' % (tps, plotname))
		plt.close()
	

#Generate graphs for each blocksize value
yvalues = ['ActualCommThrput']
for bs in dfgraph['BlockSize']:
        for y in yvalues:
                dffilter = dfgraph[dfgraph['BlockSize'] == bs]
                dffilter = dffilter.reset_index(drop=True)
                plotname = 'TPS_Vs_'+ str(y) + '_at_' + str(int(bs)) + '_Blocksize'
                plt.bar(dffilter['TPS'], dffilter[y], yerr=dffilter[y+'SE'], width=30, color='blue', edgecolor='blue', ecolor='black')
                plt.xlabel("TPS")
                plt.ylabel(y)
                plt.title(plotname)
                plt.legend()
                plt.ylim(bottom=0)
                plt.xlim(left=0)
                #plt.xticks(dffilter['BlockSize'])

                #Directory name same as ExpName in scripts/test.sh
                try:
                        os.makedirs("./PerBlocksize/%d" % (bs))
                except OSError as err:
                        print(err)
                plt.savefig('./PerBlocksize/%d/%s.png' % (bs, plotname))
                plt.close()



for tps in dfgraph['TPS']:
        dffilter = dfgraph[dfgraph['TPS'] == tps]
        plotname = 'BlockSizeVsAllThroughput'
        barWidth = 0.25
        numbars  = 2
        bars1 = dffilter['ActualCommThrput']
        bars2 = dffilter['SuccThrput']

        # Set position of bar on X axis
        r1 = np.arange(len(bars1))
        r2 = [x + barWidth for x in r1]
        dffilter = dffilter.reset_index(drop=True)
        plt.bar(r1, bars1, yerr=dffilter['ActualCommThrputSE'], color='red', width=barWidth, edgecolor='white', label='CommThrput')
        plt.bar(r2, bars2, yerr=dffilter['SuccThrputSE'], color='green', width=barWidth, edgecolor='white', label='SuccThrput')

        plt.ylim(bottom=0)
        plt.xlim(left=0)

        # Add xticks on the middle of the group bars
        plt.xlabel('Blocksize', fontweight='bold')
        plt.xticks([r + ((int(numbars/2))*barWidth) for r in range(len(bars1))], dffilter['BlockSize'])

        plt.legend(bbox_to_anchor=(1.04,1), loc="upper left")
        

        try:
                os.makedirs("./PerTps/CombinedGraphs/%d" % (tps))
        except OSError as err:
                print(err)
        plt.savefig('./PerTps/CombinedGraphs/%d/%s.png' % (tps, plotname), bbox_inches='tight')
        plt.close()

for tps in dfgraph['TPS']:
        dffilter = dfgraph[dfgraph['TPS'] == tps]
        plotname = 'BlockSizeVsLatencyAndAllThroughput'
        barWidth = 0.25
        numbars = 3
        bars1 = dffilter['AvgSuccLat']
        bars2 = dffilter['ActualCommThrput']
        bars3 = dffilter['SuccThrput']
        dffilter = dffilter.reset_index(drop=True)
        # Set position of bar on X axis
        r1 = np.arange(len(bars1))
        r2 = [x + barWidth for x in r1]
        r3 = [x + barWidth for x in r2]

        plt.bar(r1, bars1, yerr=dffilter['AvgSuccLatSE'], color='red', width=barWidth, edgecolor='white', label='AvgSuccLat')
        plt.bar(r2, bars2, yerr=dffilter['ActualCommThrputSE'], color='green', width=barWidth, edgecolor='white', label='CommThrput')
        plt.bar(r3, bars3, yerr=dffilter['SuccThrputSE'], color='yellow', width=barWidth, edgecolor='white', label='SuccThrput')

        plt.ylim(bottom=0)
        plt.xlim(left=0)

        # Add xticks on the middle of the group bars
        plt.xlabel('Blocksize', fontweight='bold')
        plt.xticks([r + ((int(numbars/2))*barWidth) for r in range(len(bars1))], dffilter['BlockSize'])

        plt.legend(bbox_to_anchor=(1.04,1), loc="upper left")
        

        try:
                os.makedirs("./PerTps/CombinedGraphs/%d" % (tps))
        except OSError as err:
                print(err)
        plt.savefig('./PerTps/CombinedGraphs/%d/%s.png' % (tps, plotname), bbox_inches='tight')
        plt.close()

for tps in dfgraph['TPS']:
        dffilter = dfgraph[dfgraph['TPS'] == tps]
        plotname = 'BlockSizeVsLatencyAndCommitThroughput'
        barWidth = 0.25
        numbars = 2
        bars1 = dffilter['AvgSuccLat']
        bars2 = dffilter['ActualCommThrput']
        dffilter = dffilter.reset_index(drop=True)
        # Set position of bar on X axis
        r1 = np.arange(len(bars1))
        r2 = [x + barWidth for x in r1]

        plt.bar(r1, bars1, yerr=dffilter['AvgSuccLatSE'], color='red', width=barWidth, edgecolor='white', label='AvgSuccLat')
        plt.bar(r2, bars2, yerr=dffilter['ActualCommThrputSE'], color='green', width=barWidth, edgecolor='white', label='CommThrput')

        plt.ylim(bottom=0)
        plt.xlim(left=0)

        # Add xticks on the middle of the group bars
        plt.xlabel('Blocksize', fontweight='bold')
        plt.xticks([r + ((int(numbars/2))*barWidth) for r in range(len(bars1))], dffilter['BlockSize'])

        plt.legend(bbox_to_anchor=(1.04,1), loc="upper left")
        

        try:
                os.makedirs("./PerTps/CombinedGraphs/%d" % (tps))
        except OSError as err:
                print(err)
        plt.savefig('./PerTps/CombinedGraphs/%d/%s.png' % (tps, plotname), bbox_inches='tight')
        plt.close()


#Source: https://python-graph-gallery.com/11-grouped-barplot/ 
#Generate combined graphs for each Blocksize value

for bs in dfgraph['BlockSize']:
        dffilter = dfgraph[dfgraph['BlockSize'] == bs]
        plotname = 'TPSVsAllThroughput'
        barWidth = 0.25
        numbars  = 2
        bars1 = dffilter['ActualCommThrput']
        bars2 = dffilter['SuccThrput']
        dffilter = dffilter.reset_index(drop=True)
        # Set position of bar on X axis
        r1 = np.arange(len(bars1))
        r2 = [x + barWidth for x in r1]

        plt.bar(r1, bars1, yerr=dffilter['ActualCommThrputSE'], color='red', width=barWidth, edgecolor='white', label='CommThrput')
        plt.bar(r2, bars2, yerr=dffilter['SuccThrputSE'], color='green', width=barWidth, edgecolor='white', label='SuccThrput')

        plt.ylim(bottom=0)
        plt.xlim(left=0)

        # Add xticks on the middle of the group bars
        plt.xlabel('TPS', fontweight='bold')
        plt.xticks([r + ((int(numbars/2))*barWidth) for r in range(len(bars1))], dffilter['TPS'])

        plt.legend(bbox_to_anchor=(1.04,1), loc="upper left")
        

        try:
                os.makedirs("./PerBlocksize/CombinedGraphs/%d" % (bs))
        except OSError as err:
                print(err)
        plt.savefig('./PerBlocksize/CombinedGraphs/%d/%s.png' % (bs, plotname), bbox_inches='tight')
        plt.close()

for bs in dfgraph['BlockSize']:
        dffilter = dfgraph[dfgraph['BlockSize'] == bs]
        plotname = 'TPSVsLatencyAndAllThroughput'
        barWidth = 0.25
        numbars = 3
        bars1 = dffilter['AvgSuccLat']
        bars2 = dffilter['ActualCommThrput']
        bars3 = dffilter['SuccThrput']
        dffilter = dffilter.reset_index(drop=True)
        # Set position of bar on X axis
        r1 = np.arange(len(bars1))
        r2 = [x + barWidth for x in r1]
        r3 = [x + barWidth for x in r2]

        plt.bar(r1, bars1, yerr=dffilter['AvgSuccLatSE'], color='red', width=barWidth, edgecolor='white', label='AvgSuccLat')
        plt.bar(r2, bars2, yerr=dffilter['ActualCommThrputSE'], color='green', width=barWidth, edgecolor='white', label='CommThrput')
        plt.bar(r3, bars3, yerr=dffilter['SuccThrputSE'], color='yellow', width=barWidth, edgecolor='white', label='SuccThrput')

        plt.ylim(bottom=0)
        plt.xlim(left=0)

        # Add xticks on the middle of the group bars
        plt.xlabel('TPS', fontweight='bold')
        plt.xticks([r + ((int(numbars/2))*barWidth) for r in range(len(bars1))], dffilter['TPS'])

        plt.legend(bbox_to_anchor=(1.04,1), loc="upper left")
        

        try:
                os.makedirs("./PerBlocksize/CombinedGraphs/%d" % (bs))
        except OSError as err:
                print(err)
        plt.savefig('./PerBlocksize/CombinedGraphs/%d/%s.png' % (bs, plotname), bbox_inches='tight')
        plt.close()

for bs in dfgraph['BlockSize']:
        dffilter = dfgraph[dfgraph['BlockSize'] == bs]
        plotname = 'TPSVsLatencyAndCommitThroughput'
        barWidth = 0.25
        numbars = 2
        bars1 = dffilter['AvgSuccLat']
        bars2 = dffilter['ActualCommThrput']

        # Set position of bar on X axis
        r1 = np.arange(len(bars1))
        r2 = [x + barWidth for x in r1]
        dffilter = dffilter.reset_index(drop=True)
        plt.bar(r1, bars1, yerr=dffilter['AvgSuccLatSE'], color='red', width=barWidth, edgecolor='white', label='AvgSuccLat')
        plt.bar(r2, bars2, yerr=dffilter['ActualCommThrputSE'], color='green', width=barWidth, edgecolor='white', label='CommThrput')

        plt.ylim(bottom=0)
        plt.xlim(left=0)

        # Add xticks on the middle of the group bars
        plt.xlabel('TPS', fontweight='bold')
        plt.xticks([r + ((int(numbars/2))*barWidth) for r in range(len(bars1))], dffilter['TPS'])

        plt.legend(bbox_to_anchor=(1.04,1), loc="upper left")
        

        try:
                os.makedirs("./PerBlocksize/CombinedGraphs/%d" % (bs))
        except OSError as err:
                print(err)
        plt.savefig('./PerBlocksize/CombinedGraphs/%d/%s.png' % (bs, plotname), bbox_inches='tight')
        plt.close()



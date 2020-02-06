#!/usr/bin/env python
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import os
import numpy as np

ExpName='avg_graph'

#Generate graphs
#dfgraph = pd.read_csv('./%s/selected_metrics_log.csv' % ExpName, delimiter=',', skiprows=1)
#dfgraph = dfgraph.reset_index(drop=True)

dfgraph1 = pd.read_csv('./%s/selected_metrics_log.csv' % ExpName, delimiter=',', skiprows=1)
dfgraph1 = dfgraph1.reset_index(drop=True)

dfgraph = dfgraph1[dfgraph1['UseCase'] == 3]
print(dfgraph)
dfgraph = dfgraph.reset_index(drop=True)


#Generate graphs for each tps value
yvalues = ['succTxPercent', 'failTxPercent', 'TotMVCCPercent', 'MVCCInterPercent', 'MVCCIntraPercent', 'PhantomReadPercent', 'EndorseFailBCPercent', 'AvgEndoLat', 'AvgOrdValLat', 'AvgSuccLat', 'CommThrput', 'SuccThrput']
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
			os.makedirs("./%s/PerTps/%d" % (ExpName, tps))
		except OSError as err:
	   		print(err)
		plt.savefig('./%s/PerTps/%d/%s.png' % (ExpName, tps, plotname))
		plt.close()
	

#Generate graphs for each blocksize value
yvalues = ['succTxPercent', 'failTxPercent', 'TotMVCCPercent', 'MVCCInterPercent', 'MVCCIntraPercent', 'PhantomReadPercent', 'EndorseFailBCPercent', 'AvgEndoLat', 'AvgOrdValLat', 'AvgSuccLat', 'CommThrput', 'SuccThrput']
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
                        os.makedirs("./%s/PerBlocksize/%d" % (ExpName, bs))
                except OSError as err:
                        print(err)
                plt.savefig('./%s/PerBlocksize/%d/%s.png' % (ExpName, bs, plotname))
                plt.close()




#Source: https://python-graph-gallery.com/11-grouped-barplot/ 
#Generate combined graphs for each tps value

for tps in dfgraph['TPS']:
	dffilter = dfgraph[dfgraph['TPS'] == tps]
	plotname = 'BlockSizeVsAllFailures'
	barWidth = 0.25
	numbars = 4
	bars1 = dffilter['failTxPercent']
	bars2 = dffilter['EndorseFailBCPercent']
	bars3 = dffilter['TotMVCCPercent']
	bars4 = dffilter['PhantomReadPercent']
 
	# Set position of bar on X axis
	r1 = np.arange(len(bars1))
	r2 = [x + barWidth for x in r1]
	r3 = [x + barWidth for x in r2]
	r4 = [x + barWidth for x in r3]
	
	dffilter = dffilter.reset_index(drop=True)
 
	plt.bar(r1, bars1, yerr=dffilter['failTxPercentSE'], color='red', width=barWidth, edgecolor='white', label='TotalFailures')
	plt.bar(r2, bars2, yerr=dffilter['EndorseFailBCPercentSE'], color='green', width=barWidth, edgecolor='white', label='EndorsementFailures')
	plt.bar(r3, bars3, yerr=dffilter['TotMVCCPercentSE'], color='yellow', width=barWidth, edgecolor='white', label='MVCCFailures')
	plt.bar(r4, bars4, yerr=dffilter['PhantomReadPercentSE'], color='black', width=barWidth, edgecolor='white', label='PhantomReads')
	#yerr=dffilter['SE'], 
	plt.ylim(bottom=0)
        plt.xlim(left=0)
 
	# Add xticks on the middle of the group bars
	plt.xlabel('Blocksize', fontweight='bold')
	plt.xticks([r + ((int(numbars/2))*barWidth) for r in range(len(bars1))], dffilter['BlockSize'])

	plt.legend(bbox_to_anchor=(1.04,1), loc="upper left") 
	#plt.legend()
	

        try:
                os.makedirs("./%s/PerTps/CombinedGraphs/%d" % (ExpName, tps))
        except OSError as err:
                print(err)
        plt.savefig('./%s/PerTps/CombinedGraphs/%d/%s.png' % (ExpName, tps, plotname), bbox_inches='tight')
	plt.close()

for tps in dfgraph['TPS']:
        dffilter = dfgraph[dfgraph['TPS'] == tps]
        plotname = 'BlockSizeVsMVCC'
        barWidth = 0.25
        numbars = 3
        bars1 = dffilter['TotMVCCPercent']
        bars2 = dffilter['MVCCInterPercent']
        bars3 = dffilter['MVCCIntraPercent']

        # Set position of bar on X axis
        r1 = np.arange(len(bars1))
        r2 = [x + barWidth for x in r1]
        r3 = [x + barWidth for x in r2]
        dffilter = dffilter.reset_index(drop=True)
        plt.bar(r1, bars1, yerr=dffilter['TotMVCCPercentSE'], color='red', width=barWidth, edgecolor='white', label='TotMVCCPercent')
        plt.bar(r2, bars2, yerr=dffilter['MVCCInterPercentSE'], color='green', width=barWidth, edgecolor='white', label='MVCCInterPercent')
        plt.bar(r3, bars3, yerr=dffilter['MVCCIntraPercentSE'], color='yellow', width=barWidth, edgecolor='white', label='MVCCIntraPercent')

        plt.ylim(bottom=0)
        plt.xlim(left=0)

        # Add xticks on the middle of the group bars
        plt.xlabel('Blocksize', fontweight='bold')
        plt.xticks([r + ((int(numbars/2))*barWidth) for r in range(len(bars1))], dffilter['BlockSize'])

        plt.legend(bbox_to_anchor=(1.04,1), loc="upper left")
        

        try:
                os.makedirs("./%s/PerTps/CombinedGraphs/%d" % (ExpName, tps))
        except OSError as err:
                print(err)
        plt.savefig('./%s/PerTps/CombinedGraphs/%d/%s.png' % (ExpName, tps, plotname), bbox_inches='tight')
        plt.close()

for tps in dfgraph['TPS']:
        dffilter = dfgraph[dfgraph['TPS'] == tps]
        plotname = 'BlockSizeVsFailureTypes'
        barWidth = 0.25
        numbars = 3
        bars1 = dffilter['EndorseFailBCPercent']
        bars2 = dffilter['TotMVCCPercent']
        bars3 = dffilter['PhantomReadPercent']

        # Set position of bar on X axis
        r1 = np.arange(len(bars1))
        r2 = [x + barWidth for x in r1]
        r3 = [x + barWidth for x in r2]
        dffilter = dffilter.reset_index(drop=True)
        plt.bar(r1, bars1, yerr=dffilter['EndorseFailBCPercentSE'], color='red', width=barWidth, edgecolor='white', label='EndorseFailBCPercent')
        plt.bar(r2, bars2, yerr=dffilter['TotMVCCPercentSE'], color='green', width=barWidth, edgecolor='white', label='TotMVCCPercent')
        plt.bar(r3, bars3, yerr=dffilter['PhantomReadPercentSE'], color='yellow', width=barWidth, edgecolor='white', label='PhantomReadPercent')

        plt.ylim(bottom=0)
        plt.xlim(left=0)

        # Add xticks on the middle of the group bars
        plt.xlabel('Blocksize', fontweight='bold')
        plt.xticks([r + ((int(numbars/2))*barWidth) for r in range(len(bars1))], dffilter['BlockSize'])

        plt.legend(bbox_to_anchor=(1.04,1), loc="upper left")
        

        try:
                os.makedirs("./%s/PerTps/CombinedGraphs/%d" % (ExpName, tps))
        except OSError as err:
                print(err)
        plt.savefig('./%s/PerTps/CombinedGraphs/%d/%s.png' % (ExpName, tps, plotname), bbox_inches='tight')
        plt.close()

for tps in dfgraph['TPS']:
        dffilter = dfgraph[dfgraph['TPS'] == tps]
        plotname = 'BlockSizeVsAllLatency'
        barWidth = 0.25
        numbars = 3
        bars1 = dffilter['AvgEndoLat']
        bars2 = dffilter['AvgOrdValLat']
        bars3 = dffilter['AvgSuccLat']

        # Set position of bar on X axis
        r1 = np.arange(len(bars1))
        r2 = [x + barWidth for x in r1]
        r3 = [x + barWidth for x in r2]
        dffilter = dffilter.reset_index(drop=True)
        plt.bar(r1, bars1, yerr=dffilter['AvgEndoLatSE'], color='red', width=barWidth, edgecolor='white', label='AvgEndoLat')
        plt.bar(r2, bars2, yerr=dffilter['AvgOrdValLatSE'], color='green', width=barWidth, edgecolor='white', label='AvgOrdValLat')
        plt.bar(r3, bars3, yerr=dffilter['AvgSuccLatSE'], color='yellow', width=barWidth, edgecolor='white', label='AvgSuccLat')

        plt.ylim(bottom=0)
        plt.xlim(left=0)

        # Add xticks on the middle of the group bars
        plt.xlabel('Blocksize', fontweight='bold')
        plt.xticks([r + ((int(numbars/2))*barWidth) for r in range(len(bars1))], dffilter['BlockSize'])

        plt.legend(bbox_to_anchor=(1.04,1), loc="upper left")
        

        try:
                os.makedirs("./%s/PerTps/CombinedGraphs/%d" % (ExpName, tps))
        except OSError as err:
                print(err)
        plt.savefig('./%s/PerTps/CombinedGraphs/%d/%s.png' % (ExpName, tps, plotname), bbox_inches='tight')
        plt.close()

for tps in dfgraph['TPS']:
        dffilter = dfgraph[dfgraph['TPS'] == tps]
        plotname = 'BlockSizeVsAllThroughput'
        barWidth = 0.25
        numbars  = 2
        bars1 = dffilter['CommThrput']
        bars2 = dffilter['SuccThrput']

        # Set position of bar on X axis
        r1 = np.arange(len(bars1))
        r2 = [x + barWidth for x in r1]
        dffilter = dffilter.reset_index(drop=True)
        plt.bar(r1, bars1, yerr=dffilter['CommThrputSE'], color='red', width=barWidth, edgecolor='white', label='CommThrput')
        plt.bar(r2, bars2, yerr=dffilter['SuccThrputSE'], color='green', width=barWidth, edgecolor='white', label='SuccThrput')

        plt.ylim(bottom=0)
        plt.xlim(left=0)

        # Add xticks on the middle of the group bars
        plt.xlabel('Blocksize', fontweight='bold')
        plt.xticks([r + ((int(numbars/2))*barWidth) for r in range(len(bars1))], dffilter['BlockSize'])

        plt.legend(bbox_to_anchor=(1.04,1), loc="upper left")
        

        try:
                os.makedirs("./%s/PerTps/CombinedGraphs/%d" % (ExpName, tps))
        except OSError as err:
                print(err)
        plt.savefig('./%s/PerTps/CombinedGraphs/%d/%s.png' % (ExpName, tps, plotname), bbox_inches='tight')
        plt.close()

for tps in dfgraph['TPS']:
        dffilter = dfgraph[dfgraph['TPS'] == tps]
        plotname = 'BlockSizeVsLatencyAndAllThroughput'
        barWidth = 0.25
        numbars = 3
        bars1 = dffilter['AvgSuccLat']
        bars2 = dffilter['CommThrput']
        bars3 = dffilter['SuccThrput']
        dffilter = dffilter.reset_index(drop=True)
        # Set position of bar on X axis
        r1 = np.arange(len(bars1))
        r2 = [x + barWidth for x in r1]
        r3 = [x + barWidth for x in r2]

        plt.bar(r1, bars1, yerr=dffilter['AvgSuccLatSE'], color='red', width=barWidth, edgecolor='white', label='AvgSuccLat')
        plt.bar(r2, bars2, yerr=dffilter['CommThrputSE'], color='green', width=barWidth, edgecolor='white', label='CommThrput')
        plt.bar(r3, bars3, yerr=dffilter['SuccThrputSE'], color='yellow', width=barWidth, edgecolor='white', label='SuccThrput')

        plt.ylim(bottom=0)
        plt.xlim(left=0)

        # Add xticks on the middle of the group bars
        plt.xlabel('Blocksize', fontweight='bold')
        plt.xticks([r + ((int(numbars/2))*barWidth) for r in range(len(bars1))], dffilter['BlockSize'])

        plt.legend(bbox_to_anchor=(1.04,1), loc="upper left")
        

        try:
                os.makedirs("./%s/PerTps/CombinedGraphs/%d" % (ExpName, tps))
        except OSError as err:
                print(err)
        plt.savefig('./%s/PerTps/CombinedGraphs/%d/%s.png' % (ExpName, tps, plotname), bbox_inches='tight')
        plt.close()

for tps in dfgraph['TPS']:
        dffilter = dfgraph[dfgraph['TPS'] == tps]
        plotname = 'BlockSizeVsLatencyAndCommitThroughput'
        barWidth = 0.25
        numbars = 2
        bars1 = dffilter['AvgSuccLat']
        bars2 = dffilter['CommThrput']
        dffilter = dffilter.reset_index(drop=True)
        # Set position of bar on X axis
        r1 = np.arange(len(bars1))
        r2 = [x + barWidth for x in r1]

        plt.bar(r1, bars1, yerr=dffilter['AvgSuccLatSE'], color='red', width=barWidth, edgecolor='white', label='AvgSuccLat')
        plt.bar(r2, bars2, yerr=dffilter['CommThrputSE'], color='green', width=barWidth, edgecolor='white', label='CommThrput')

        plt.ylim(bottom=0)
        plt.xlim(left=0)

        # Add xticks on the middle of the group bars
        plt.xlabel('Blocksize', fontweight='bold')
        plt.xticks([r + ((int(numbars/2))*barWidth) for r in range(len(bars1))], dffilter['BlockSize'])

        plt.legend(bbox_to_anchor=(1.04,1), loc="upper left")
        

        try:
                os.makedirs("./%s/PerTps/CombinedGraphs/%d" % (ExpName, tps))
        except OSError as err:
                print(err)
        plt.savefig('./%s/PerTps/CombinedGraphs/%d/%s.png' % (ExpName, tps, plotname), bbox_inches='tight')
        plt.close()


#Source: https://python-graph-gallery.com/11-grouped-barplot/ 
#Generate combined graphs for each Blocksize value

for bs in dfgraph['BlockSize']:
	dffilter = dfgraph[dfgraph['BlockSize'] == bs]
	plotname = 'TPSVsAllFailures'
	barWidth = 0.25
	numbars = 4
	bars1 = dffilter['failTxPercent']
	bars2 = dffilter['EndorseFailBCPercent']
	bars3 = dffilter['TotMVCCPercent']
	bars4 = dffilter['PhantomReadPercent']
 
	# Set position of bar on X axis
	r1 = np.arange(len(bars1))
	r2 = [x + barWidth for x in r1]
	r3 = [x + barWidth for x in r2]
	r4 = [x + barWidth for x in r3]
        dffilter = dffilter.reset_index(drop=True)
	plt.bar(r1, bars1, yerr=dffilter['failTxPercentSE'], color='red', width=barWidth, edgecolor='white', label='TotalFailures')
	plt.bar(r2, bars2, yerr=dffilter['EndorseFailBCPercentSE'], color='green', width=barWidth, edgecolor='white', label='EndorsementFailures')
	plt.bar(r3, bars3, yerr=dffilter['TotMVCCPercentSE'], color='yellow', width=barWidth, edgecolor='white', label='MVCCFailures')
	plt.bar(r4, bars4, yerr=dffilter['PhantomReadPercentSE'], color='black', width=barWidth, edgecolor='white', label='PhantomReads')

	plt.ylim(bottom=0)
        plt.xlim(left=0)
 
	# Add xticks on the middle of the group bars
	plt.xlabel('TPS', fontweight='bold')
	plt.xticks([r + ((int(numbars/2))*barWidth) for r in range(len(bars1))], dffilter['TPS'])
 
	plt.legend(bbox_to_anchor=(1.04,1), loc="upper left")
	

        try:
                os.makedirs("./%s/PerBlocksize/CombinedGraphs/%d" % (ExpName, bs))
        except OSError as err:
                print(err)
        plt.savefig('./%s/PerBlocksize/CombinedGraphs/%d/%s.png' % (ExpName, bs, plotname), bbox_inches='tight')
	plt.close()

for bs in dfgraph['BlockSize']:
        dffilter = dfgraph[dfgraph['BlockSize'] == bs]
        plotname = 'TPSVsMVCC'
        barWidth = 0.25
        numbars = 3
        bars1 = dffilter['TotMVCCPercent']
        bars2 = dffilter['MVCCInterPercent']
        bars3 = dffilter['MVCCIntraPercent']
        dffilter = dffilter.reset_index(drop=True)
        # Set position of bar on X axis
        r1 = np.arange(len(bars1))
        r2 = [x + barWidth for x in r1]
        r3 = [x + barWidth for x in r2]

        plt.bar(r1, bars1, yerr=dffilter['TotMVCCPercentSE'], color='red', width=barWidth, edgecolor='white', label='TotMVCCPercent')
        plt.bar(r2, bars2, yerr=dffilter['MVCCInterPercentSE'], color='green', width=barWidth, edgecolor='white', label='MVCCInterPercent')
        plt.bar(r3, bars3, yerr=dffilter['MVCCIntraPercentSE'], color='yellow', width=barWidth, edgecolor='white', label='MVCCIntraPercent')

        plt.ylim(bottom=0)
        plt.xlim(left=0)

        # Add xticks on the middle of the group bars
        plt.xlabel('TPS', fontweight='bold')
        plt.xticks([r + ((int(numbars/2))*barWidth) for r in range(len(bars1))], dffilter['TPS'])

        plt.legend(bbox_to_anchor=(1.04,1), loc="upper left")
        

        try:
                os.makedirs("./%s/PerBlocksize/CombinedGraphs/%d" % (ExpName, bs))
        except OSError as err:
                print(err)
        plt.savefig('./%s/PerBlocksize/CombinedGraphs/%d/%s.png' % (ExpName, bs, plotname), bbox_inches='tight')
        plt.close()

for bs in dfgraph['BlockSize']:
        dffilter = dfgraph[dfgraph['BlockSize'] == bs]
        plotname = 'TPSVsFailureTypes'
        barWidth = 0.25
        numbars = 3
        bars1 = dffilter['EndorseFailBCPercent']
        bars2 = dffilter['TotMVCCPercent']
        bars3 = dffilter['PhantomReadPercent']
        dffilter = dffilter.reset_index(drop=True)
        # Set position of bar on X axis
        r1 = np.arange(len(bars1))
        r2 = [x + barWidth for x in r1]
        r3 = [x + barWidth for x in r2]

        plt.bar(r1, bars1, yerr=dffilter['EndorseFailBCPercentSE'], color='red', width=barWidth, edgecolor='white', label='EndorseFailBCPercent')
        plt.bar(r2, bars2, yerr=dffilter['TotMVCCPercentSE'], color='green', width=barWidth, edgecolor='white', label='TotMVCCPercent')
        plt.bar(r3, bars3, yerr=dffilter['PhantomReadPercentSE'], color='yellow', width=barWidth, edgecolor='white', label='PhantomReadPercent')

        plt.ylim(bottom=0)
        plt.xlim(left=0)

        # Add xticks on the middle of the group bars
        plt.xlabel('TPS', fontweight='bold')
        plt.xticks([r + ((int(numbars/2))*barWidth) for r in range(len(bars1))], dffilter['TPS'])

        plt.legend(bbox_to_anchor=(1.04,1), loc="upper left")
        

        try:
                os.makedirs("./%s/PerBlocksize/CombinedGraphs/%d" % (ExpName, bs))
        except OSError as err:
                print(err)
        plt.savefig('./%s/PerBlocksize/CombinedGraphs/%d/%s.png' % (ExpName, bs, plotname), bbox_inches='tight')
        plt.close()

for bs in dfgraph['BlockSize']:
        dffilter = dfgraph[dfgraph['BlockSize'] == bs]
        plotname = 'TPSVsAllLatency'
        barWidth = 0.25
        numbars = 3
        bars1 = dffilter['AvgEndoLat']
        bars2 = dffilter['AvgOrdValLat']
        bars3 = dffilter['AvgSuccLat']
        dffilter = dffilter.reset_index(drop=True)
        # Set position of bar on X axis
        r1 = np.arange(len(bars1))
        r2 = [x + barWidth for x in r1]
        r3 = [x + barWidth for x in r2]

        plt.bar(r1, bars1, yerr=dffilter['AvgEndoLatSE'], color='red', width=barWidth, edgecolor='white', label='AvgEndoLat')
        plt.bar(r2, bars2, yerr=dffilter['AvgOrdValLatSE'], color='green', width=barWidth, edgecolor='white', label='AvgOrdValLat')
        plt.bar(r3, bars3, yerr=dffilter['AvgSuccLatSE'], color='yellow', width=barWidth, edgecolor='white', label='AvgSuccLat')

        plt.ylim(bottom=0)
        plt.xlim(left=0)

        # Add xticks on the middle of the group bars
        plt.xlabel('TPS', fontweight='bold')
        plt.xticks([r + ((int(numbars/2))*barWidth) for r in range(len(bars1))], dffilter['TPS'])

        plt.legend(bbox_to_anchor=(1.04,1), loc="upper left")
        

        try:
                os.makedirs("./%s/PerBlocksize/CombinedGraphs/%d" % (ExpName, bs))
        except OSError as err:
                print(err)
        plt.savefig('./%s/PerBlocksize/CombinedGraphs/%d/%s.png' % (ExpName, bs, plotname), bbox_inches='tight')
        plt.close()

for bs in dfgraph['BlockSize']:
        dffilter = dfgraph[dfgraph['BlockSize'] == bs]
        plotname = 'TPSVsAllThroughput'
        barWidth = 0.25
        numbars  = 2
        bars1 = dffilter['CommThrput']
        bars2 = dffilter['SuccThrput']
        dffilter = dffilter.reset_index(drop=True)
        # Set position of bar on X axis
        r1 = np.arange(len(bars1))
        r2 = [x + barWidth for x in r1]

        plt.bar(r1, bars1, yerr=dffilter['CommThrputSE'], color='red', width=barWidth, edgecolor='white', label='CommThrput')
        plt.bar(r2, bars2, yerr=dffilter['SuccThrputSE'], color='green', width=barWidth, edgecolor='white', label='SuccThrput')

        plt.ylim(bottom=0)
        plt.xlim(left=0)

        # Add xticks on the middle of the group bars
        plt.xlabel('TPS', fontweight='bold')
        plt.xticks([r + ((int(numbars/2))*barWidth) for r in range(len(bars1))], dffilter['TPS'])

        plt.legend(bbox_to_anchor=(1.04,1), loc="upper left")
        

        try:
                os.makedirs("./%s/PerBlocksize/CombinedGraphs/%d" % (ExpName, bs))
        except OSError as err:
                print(err)
        plt.savefig('./%s/PerBlocksize/CombinedGraphs/%d/%s.png' % (ExpName, bs, plotname), bbox_inches='tight')
        plt.close()

for bs in dfgraph['BlockSize']:
        dffilter = dfgraph[dfgraph['BlockSize'] == bs]
        plotname = 'TPSVsLatencyAndAllThroughput'
        barWidth = 0.25
        numbars = 3
        bars1 = dffilter['AvgSuccLat']
        bars2 = dffilter['CommThrput']
        bars3 = dffilter['SuccThrput']
        dffilter = dffilter.reset_index(drop=True)
        # Set position of bar on X axis
        r1 = np.arange(len(bars1))
        r2 = [x + barWidth for x in r1]
        r3 = [x + barWidth for x in r2]

        plt.bar(r1, bars1, yerr=dffilter['AvgSuccLatSE'], color='red', width=barWidth, edgecolor='white', label='AvgSuccLat')
        plt.bar(r2, bars2, yerr=dffilter['CommThrputSE'], color='green', width=barWidth, edgecolor='white', label='CommThrput')
        plt.bar(r3, bars3, yerr=dffilter['SuccThrputSE'], color='yellow', width=barWidth, edgecolor='white', label='SuccThrput')

        plt.ylim(bottom=0)
        plt.xlim(left=0)

        # Add xticks on the middle of the group bars
        plt.xlabel('TPS', fontweight='bold')
        plt.xticks([r + ((int(numbars/2))*barWidth) for r in range(len(bars1))], dffilter['TPS'])

        plt.legend(bbox_to_anchor=(1.04,1), loc="upper left")
        

        try:
                os.makedirs("./%s/PerBlocksize/CombinedGraphs/%d" % (ExpName, bs))
        except OSError as err:
                print(err)
        plt.savefig('./%s/PerBlocksize/CombinedGraphs/%d/%s.png' % (ExpName, bs, plotname), bbox_inches='tight')
        plt.close()

for bs in dfgraph['BlockSize']:
        dffilter = dfgraph[dfgraph['BlockSize'] == bs]
        plotname = 'TPSVsLatencyAndCommitThroughput'
        barWidth = 0.25
        numbars = 2
        bars1 = dffilter['AvgSuccLat']
        bars2 = dffilter['CommThrput']

        # Set position of bar on X axis
        r1 = np.arange(len(bars1))
        r2 = [x + barWidth for x in r1]
        dffilter = dffilter.reset_index(drop=True)
        plt.bar(r1, bars1, yerr=dffilter['AvgSuccLatSE'], color='red', width=barWidth, edgecolor='white', label='AvgSuccLat')
        plt.bar(r2, bars2, yerr=dffilter['CommThrputSE'], color='green', width=barWidth, edgecolor='white', label='CommThrput')

        plt.ylim(bottom=0)
        plt.xlim(left=0)

        # Add xticks on the middle of the group bars
        plt.xlabel('TPS', fontweight='bold')
        plt.xticks([r + ((int(numbars/2))*barWidth) for r in range(len(bars1))], dffilter['TPS'])

        plt.legend(bbox_to_anchor=(1.04,1), loc="upper left")
        

        try:
                os.makedirs("./%s/PerBlocksize/CombinedGraphs/%d" % (ExpName, bs))
        except OSError as err:
                print(err)
        plt.savefig('./%s/PerBlocksize/CombinedGraphs/%d/%s.png' % (ExpName, bs, plotname), bbox_inches='tight')
        plt.close()



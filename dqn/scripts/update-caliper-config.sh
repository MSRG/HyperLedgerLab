#!/bin/bash

# !IMPORTANT! hardcoded values, change with your own
cd /home/ubuntu/hlft-store/caliper
# replace all tps value
sed -i "s/.*tps.*/        tps: $1/" benchmarks/fabcar/config.yaml
# set the first tps value to 1 (init)
sed -i "0,/.*tps.*/s/.*tps.*/        tps: 1/" benchmarks/fabcar/config.yaml

# replace all the assets value
sed -i "s/.*assets.*/      assets: $2/" benchmarks/fabcar/config.yaml
#!/bin/bash

# !IMPORTANT! hardcoded values, change with your own
cd /opt/share/caliper/blockchain/benchmark/fabcar
# replace all tps value
sed -i "s/.*tps.*/        tps: $1/" config_pod.yaml
# set the first tps value to 1 (init)
sed -i "0,/.*tps.*/s/.*tps.*/        tps: 1/" config_pod.yaml

# replace all the assets value
sed -i "s/.*assets.*/        assets: $2/" config_pod.yaml

cat config_pod.yaml
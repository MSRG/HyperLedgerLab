#!/usr/bin/env bash

durationrange=(10 20 30 40 50 60 70 80 90 100 110 120)
delay=10
txDuration=${durationrange[$(($RANDOM % 5))]}
sed -i "8s/.*/      txDuration: ${txDuration}/" /home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/electronic-health-record/config.yaml
sed -i "17s/.*/      txDuration: ${delay}/" /home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/electronic-health-record/config.yaml
sed -i "25s/.*/      txDuration: ${txDuration}/" /home/ubuntu/HyperLedgerLab/inventory/blockchain/benchmark/electronic-health-record/config.yaml



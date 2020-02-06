#!/bin/bash

./scripts/finalmetricscreate.py

./scripts/comma-fill-empty-values.sh 1finalmetricslog.csv 0
./scripts/comma-fill-empty-values.sh 2finalmetricslog.csv 0
./scripts/comma-fill-empty-values.sh 3finalmetricslog.csv 0
./scripts/comma-fill-empty-values.sh 4finalmetricslog.csv 0
./scripts/comma-fill-empty-values.sh 5finalmetricslog.csv 0

./scripts/calculateaverage.py

mv *.csv avg_graph/


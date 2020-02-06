#!/bin/bash

removeneg="$(awk -vOFS='\t' '{for(i=1;i<=NF;i++)if($i<0)$i=0}1' $1)"
echo "$removeneg" > $1  

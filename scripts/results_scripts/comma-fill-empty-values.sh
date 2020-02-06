#!/bin/bash

for i in $( seq 1 2); do
  sed -e "s/^,/$2,/" -e "s/,,/,$2,/g" -e "s/,$/,$2/" -i $1
done

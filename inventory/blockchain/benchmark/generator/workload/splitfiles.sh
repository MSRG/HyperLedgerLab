rm w*
rm *_generatedtransactions.txt
cp ~/HyperLedgerLab/inventory/blockchain/Generator/*_generatedtransactions.txt ~/HyperLedgerLab/inventory/blockchain/benchmark/generator/workload/
split -l 5760 uniform_generatedtransactions.txt wuniform -d
split -l 5760 readheavy_generatedtransactions.txt wreadheavy -d
split -l 5760 writeheavy_generatedtransactions.txt wwriteheavy -d
split -l 5760 rangeheavy_generatedtransactions.txt wrangeheavy -d
split -l 5760 insertheavy_generatedtransactions.txt winsertheavy -d
split -l 5760 updateheavy_generatedtransactions.txt wupdateheavy -d
split -l 5760 deleteheavy_generatedtransactions.txt wdeleteheavy -d
split -l 5760 couchdbheavy_generatedtransactions.txt wcouchdbheavy -d

split -l 5760 norangedeleteheavy_generatedtransactions.txt wnorangedeleteheavy -d
split -l 5760 norangereadheavy_generatedtransactions.txt wnorangereadheavy -d
split -l 5760 norangeuniform_generatedtransactions.txt wnorangeuniform -d
split -l 5760 norangeupdateheavy_generatedtransactions.txt wnorangeupdateheavy -d

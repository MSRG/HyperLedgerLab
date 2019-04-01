Collect Metrics on Fabric Network
=================================

This is the final step in this project. It is required to test a chaincode on the deployed fabric network and collect some metrics.

[Hyperledger Caliper](https://hyperledger.github.io/caliper/) is used in this step.
* _"Caliper is a blockchain performance benchmark framework, which allows users to test different blockchain solutions with predefined use cases, and get a set of performance test results."_
* It uses `nodejs` to perform operations

**Code location:**
- [caliper/](../caliper): It contains code for external module "caliper".
- [inventory/blockchain/benchmark/](../inventory/blockchain/benchmark): Directory which contains benchmarks defined for Caliper. See [fabcar/](../inventory/blockchain/benchmark/fabcar) and [marbles/](../inventory/blockchain/benchmark/marbles) as example
- [inventory/blockchain/src/contract/](../inventory/blockchain/src/contract): Directory which contains chaincodes used by Caliper. See [fabcar/](../inventory/blockchain/src/contract/fabcar) and [marbles/](../inventory/blockchain/src/contract/marbles) as example 

Collect  Metrics
---------------

**Command**: `node ./caliper/scripts/main.js -c inventory/blockchain/benchmark/<benchmark_name>/config.yaml -n inventory/blockchain/fabric_ccp_network.yaml`

e.g. to exeucte `fabcar` benchmark, Run Command: `node ./caliper/scripts/main.js -c inventory/blockchain/benchmark/fabcar/config.yaml -n inventory/blockchain/fabric_ccp_network.yaml`

**Variables**: Defined in the [FabricSetup](FabricSetup.md) step. File: [blockchain-setup.yaml](../inventory/blockchain/group_vars/blockchain-setup.yaml)

#### How it works ?

Configuration for fabric network and chaincode(s), which can be installed on network in this command, is already done in [FabricSetup](FabricSetup.md) step. File `inventory/blockchain/fabric_ccp_network.yaml` is created as a result.

The example command will call the `fabcar` benchmark and perform some rounds of testing for various transactions as defined in [fabcar/config.yaml](../inventory/blockchain/benchmark/fabcar/config.yaml). See Caliper [documentation for details](https://hyperledger.github.io/caliper/docs/2_Architecture.html#configuration-file) on `config.yaml` options



Metrics collected
-----------------

Following metrics are collected:
1. Success rate
2. Read Throughput and Latency
3. Write Throughput and Latency


Example Result from Caliper: 
- 5 rounds of testing with 10 clients:
- **initLedger (write)**: 1 tps (defined but since 10 client so atleast 10 tps)
- **createCar (write)**: Round1: 1000 transaction, 100 tps fixed-rate
- **createCar (write)**: Round2: 1000 transaction, 200 tps fixed-rate
- **queryAllCars (read)**: 1000 transaction, 100 tps fixed-rate
- **queryCar (read)**: 1000 transaction, 200 tps fixed-rate
        
```
    +------+--------------+------+------+-----------+-------------+-------------+-------------+------------+
    | Test | Name         | Succ | Fail | Send Rate | Max Latency | Min Latency | Avg Latency | Throughput |
    |------|--------------|------|------|-----------|-------------|-------------|-------------|------------|
    | 1    | initLedger   | 9    | 0    | 11.8 tps  | 0.52 s      | 0.20 s      | 0.36 s      | 9.0 tps    |
    |------|--------------|------|------|-----------|-------------|-------------|-------------|------------|
    | 2    | createCar    | 1000 | 0    | 99.2 tps  | 1.39 s      | 0.09 s      | 0.32 s      | 97.8 tps   |
    |------|--------------|------|------|-----------|-------------|-------------|-------------|------------|
    | 3    | createCar    | 1000 | 0    | 198.3 tps | 1.34 s      | 0.14 s      | 0.66 s      | 174.4 tps  |
    |------|--------------|------|------|-----------|-------------|-------------|-------------|------------|
    | 4    | queryAllCars | 1000 | 0    | 100.1 tps | 6.93 s      | 0.26 s      | 2.94 s      | 59.8 tps   |
    |------|--------------|------|------|-----------|-------------|-------------|-------------|------------|
    | 5    | queryCar     | 1000 | 0    | 193.5 tps | 1.59 s      | 0.11 s      | 0.45 s      | 188.1 tps  |
    +------+--------------+------+------+-----------+-------------+-------------+-------------+------------+
```

Benchmark: fabcar
-----------------

Caliper documentation for creating custom benchmarks can be found [here](https://hyperledger.github.io/caliper/docs/Writing_Benchmarks.html) 

A custom benchmark for `fabcar` chaincode has been created in this project. 

* Smart contract (or Chaincode): [contract/fabcar/go/](../inventory/blockchain/src/contract/fabcar/go)
* Benchmark: [fabcar/](../inventory/blockchain/benchmark/fabcar)

There are 3 different types of files in the benchmark:
1. [fabcar/main.js](../inventory/blockchain/benchmark/fabcar/main.js): This file is the entry point to this benchmark. Every benchmark should contain this file
2. Transaction file: This file defines a transaction type in the chaincode. 
    * It contains logic to make multiple unique transactions of this transaction type. See [fabcar/createCar.js](../inventory/blockchain/benchmark/fabcar/createCar.js) for example.
    * Create this file for each transaction type which should be used during metrics collection
3. [fabcar/config.yaml](../inventory/blockchain/benchmark/fabcar/config.yaml): This file is the benchmark configuration file. 
    * It defined various parameters of benchmarking e.g number of rounds per transaction, rate-control etc
    * See [documentation for options](https://hyperledger.github.io/caliper/docs/2_Architecture.html#configuration-file)

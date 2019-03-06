Shell Scripts
==============

Some shell scripts are provided to automate environment setup and provide a logical grouping of various steps.

All shell scripts are located in [scripts/](../scripts) directory

Following shell scripts are availables:

1. [setup_env.sh](../scripts/setup_env.sh): This script is used by all other shell scripts to setup proper environment. It can sets up both python (used by ansible) and nodejs (used by caliper) environment.
    * `sh setup_env.sh`
        * cd to project root
        * If python virtual environment not present:
            * Create python3 virtual environment. 
            * Install requirements from [requiremenents.txt](../requirements.txt) and [kubespray/requirements.txt](../kubespray/requirements.txt)
        * Activate Python virtual environment
        * Create `ansible.log` file if doesnt exists
    * `sh setup_env.sh node`
        * cd to project root
        * If node_modules not present:
            * Install node version 8.x
            * Install project requirements from [package.json](../package.json) and hyperledger fabric dependencies
        
2. [k8s_setup.sh](../scripts/k8s_setup.sh): This scripts combines the following:
    1. Create openstack infrastructure as defined in [InfrastructureSetup](InfrastructureSetup.md)
    2. Create k8s cluster as defined in [ClusterSetup](ClusterSetup.md)
    
3. [fabric_setup.sh](../scripts/fabric_setup.sh): This script create a fabric network as defined in [FabricSetup](FabricSetup.md)
    * All arguments passed to this script are added to ansible-playbook command e.g. `./scripts/fabric_setup.sh -e fabric_version=1.2.1` will create fabric 1.2.1 network

4. [get_metrics.sh](../scripts/get_metrics.sh): This script runs a Caliper benchmark and collect metrics
    * Chaincode name can be passed as an argument to run benchmark for that chaincode e.g. 
        * `./script/get_metrics.sh fabcar` will run [inventory/blockchain/benchmark/fabcar/main.js](../inventory/blockchain/benchmark/fabcar/main.js)
        * `./script/get_metrics.sh marbles` will run [inventory/blockchain/benchmark/marbles/main.js](../inventory/blockchain/benchmark/marbles/main.js)

5. [fabric_delete.sh](../scripts/fabric_delete.sh): This script will delete fabric network from kubernetes cluster. User will be prompted before deletion.

6. [k8s_delete.sh](../scripts/k8s_delete.sh): This script will delete openstack infrastructure. User will be prompted before deletion

**Quick Setup**
------------

1. Openstack Prepare:
    * Security Groups: 
        * Option1: Add appropriate openstack security groups
            * Goto: Compute > Access & Security > Security Groups > "+ CREATE SECURITY GROUP"
            * Create 3 Security Groups: `dns`, `kube-cluster`, `load-balancer`
            * For each security group, add rules one by one as defined in [FirewallPolicies.txt](FirewallPolicies.txt)
                * e.g for `kube-cluster` security group and rule: `Ingress	        IPv4	        TCP	            2379 - 2380	    -	                kube-cluster`
                    * click "MANAGE RULES": security group rules page opens.
                    * click "+ ADD RULE" and enter following values in the "Add Rule" popoup
                    ```
                    Rule: Custom TCP Rule
                    Direction: Ingress
                    Open: PortRange 
                    From Port: 2379
                    To Port: 2380
                    Remote: Security Group
                    Security Group: kube-cluster
                    Ether Type: IPv4
                    ```
        * Option 2: (**INSECURE**) Use `default` security group (allow all access), you can change every configuration to default later in this setup.
    * Add SSH keypair in Openstack:
        * Create a keypair in Openstack with name "default-image-key" (or you can choose another name): Compute > Access & Security > Key Pairs > "+ CREATE KEY PAIR"
        * Download the private key, we will use this later in the setup.

2. Create an instance in your Openstack account and name it "CLI"
    * This instance will be used as the access point to kubernetes and fabric network
    * Copy the "private key" downloaded above to CLI instance: `scp <path to private_key> ubuntu@<cli_ip>:/home/ubuntu/.ssh/default-image-key.pem`
    * SSH into CLI and all following commands should be executed from this instance.

3. Clone the repository:
    * `git clone --recursive https://github.com/MSRG/HyperLedgerLab.git`
    * `cd HyperLedgerLab`

3. Create .env file with details about Openstack authentication
    * Copy `env_sample` to `.env`
    * Provide appropriate details: "OS_USERNAME", "OS_PASSWORD", "OS_PROJECT_NAME"

3. "keypair" setting:
    * Set permission for "private key" file: `chmod 600 /home/ubuntu/.ssh/default-image-key.pem`
    * Provide the "private key" file path on CLI (if not "/home/ubuntu/.ssh/default-image-key.pem") in `OS_IMAGE_SSH_KEY` variable in `.env` file.
    * Provide the "keypair" name, as created in "Openstack Prepare" step (if not "default-image-key") in `k8s_instance_image_key` varibale in [os-infra.yml](../inventory/infra/group_vars/os-infra.yml) file.

3. Setup kubernetes cluster
    * Check that all details are correct and match Openstack account here: [os-infra.yml](../inventory/infra/group_vars/os-infra.yml). Make modifications if required
        * OS Instance Sizes: Ideally all instances should be size m1.medium or above
        * OS Security Groups: If you don't create security groups as mentioned above then change all to `default`.
    * Edit file [openstack_instance.py](../openstack_infra/roles/os_instance/files/openstack_instance.py) at line 226 and add current location of openstackall.crt
        * sess = session.Session(auth=auth, verify='/home/ubuntu/HyperledgerLab/openstackall.crt')
    * Run Command: `./scripts/k8s_setup.sh` (Error 2. from Common Errors –on the bottom of this page– might occur.)
    * Estimated time to complete: **25 minutes**
    * After execution run: `source ~/.bash_aliases`
    * Access details:
        * Kubernetes dashboard: **https://<k8slb_ip>:8443**
        * Get Access Token: `kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep admin-user | awk '{print $1}')`
    * What will happen ?
        * It will setup the python environment
        * It will create Openstack infra with command: `ansible-playbook -i inventory/infra/hosts.ini -v infra_setup.yaml`
        * It will create a kubernetes cluster with command: `ansible-playbook -i inventory/cluster/hosts.ini -v cluster_setup.yaml`

4. Delete kubernetes cluster:
    * Run Command: `./scripts/k8s_delete.sh`
    * Estimated time to complete: **30 seconds**
    * What will happen ?
        * It will delete Openstack infra with command: `ansible-playbook -i inventory/infra/hosts.ini -v infra_delete.yaml`
    * If there are dependency issues when deleting and restarting the cluster, run comman: `rm -rf venv`

5. Create Fabric Blockchain on kubernetes:
    * Run Command: `./scripts/fabric_setup.sh`
    * Estimated time to complete: **120 seconds**
    * By default fabric version 1.4.0 is installed.
    * To create with a CLI pod in each organisation: `./scripts/fabric_setup.sh -e fabric_create_cli=true`
    * To use kafka as Orderer consensus: `./scripts/fabric_setup.sh -e fabric_orderer_type=kafka`
    * To use fabric version 1.2.1: `./scripts/fabric_setup.sh -e fabric_version=1.2.1`
    * Other variables used in [blockchain_setup.yaml](../inventory/blockchain/group_vars/blockchain-setup.yaml) can be over-ridden in same way as above
    * What will happen ?
        * It will deploy a Fabric network on kubernetes with command: `ansible-playbook -i inventory/blockchain/hosts.ini -v blockchain_setup.yaml`
        * Then it will create sample channel and join all peers into it.
    * For use-case based chaincodes and generated chaincodes do not run `./scripts/fabric_setup.sh`. Instead follow the instructions given below.

6. Delete Fabric Blockchain on kubernetes:
    * Run Command: `./scripts/fabric_delete.sh`
    * Estimated time to complete: **120 seconds**
    * What will happen ?
        * It will delete Fabric Blockchain on kubernetes with command: `ansible-playbook -i inventory/blockchain/hosts.ini -v blockchain_delete.yaml`
        * `crypto_config` and `channel_artifacts` will be deleted as well
    * If you want to force delete the kubernetes pods and namespaces replace hyperledger/roles/network_setup/files/delete_k8s_blockchain.py with the force_delete_k8s_blockchain.py file in the same folder.
    * If there are node dependency issues when deleting and restarting a fabric network, run comman: `rm -rf node_modules`

7. Benchmarking: Get chaincode metrics:
    * Run Command: `./scripts/get_metrics.sh <chaincode>`
    * e.g `./scripts/get_metrics.sh fabcar`
    * Estimated time to complete: **180 seconds** 
        * This time is for default test settings defined in [fabcar/config.yaml](../inventory/blockchain/benchmark/fabcar/config.yaml)
        * Execution time depends on various factors e.g number of rounds, transactions etc)
    * What will happen ?
        * It will install, instantiate chaincode on the network using Caliper
        * Then it will run some rounds of testing
        * A HTML report will be created with the metrics gathered. Location of report will be displayed at the end of testing
    * For using different chaincodes specify the chaincode in inventory/blockchain/group_vars/blockchain-setup.yaml
    * For use-case based chaincodes and generated chaincodes follow the instructions given below.

8. Using the use-case based chaincodes and workloads (electronic-health-record, e-voting, supplychain, drm)
    * Run Command: `./scripts/run_benchmark.sh <chaincode>`
    * This script includes the fabric_setup, get_metrics and fabric_delete as well as chaincode specific scripts that is required for setting up the workload.

9. Using the chaincode and workload generator
    * Edit inventory/blockchain/Generator/chaincodeGenerator.go to give different input parameters and generate corresponding chaincode.
    * `cd inventory/blockchain/Generator/`
    * `go run chaincodeGenerator.go`
    * Edit inventory/blockchain/Generator/transactiongenerator.js to give different input parameters and generate corresponding workloads.
    * `cd inventory/blockchain/Generator/`
    * `node transactiongenerator.js <workload_type>`

10. Using the generated chaincode and workload with caliper
    * inventory/blockchain/benchmark/generator/ contains the caliper benchmarking files suitable for generated workloads. 
    * Modify these files based on the type of generated workloads.
    * If you are using the existing files then run command: `cp editedcaliperfiles/local-client.js caliper/src/comm/client/`
    * Use the script inventory/blockchain/benchmark/generator/workload/splitfiles.sh to copy the generated workloads to inventory/blockchain/benchmark/generator/workload and split large workloads.
    * The generated chaincode should be copied to inventory/blockchain/src/contract/generator/
    * To run the benchmark with generated chaincode and workload: `./scripts/gen_run_benchmark.sh <chaincode>`

11. Collecting additional metrics from the blockchain
    * You can extend the caliper scripts to collect additional metrics regarding transaction failures by replacing the specific files in the caliper/ folder with the corresponding files in the editedcaliperfiles/ folder.
        
Fabric-Metrics Workflow:
-----
* Create Network: `./scripts/fabric_setup.sh [args]`
* Get Metrics:  `./scripts/get_metrics.sh <chaincode>`
* Delete Network: `./scripts/fabric_delete.sh`
        
Kubernetes Dashboard Access
-----
* URL: `https://<k8slb_ip_address>:8443`
* Access Token: Get from terminal via command `kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep admin-user | awk '{print $1}')`

Fabric Network Options
-----

#### Use custom Fabric images

* Create your image (fabric, ca, tools, orderer etc) and upload to dockerhub
* Image definition can be found in file [blockchain_setup.yaml](../inventory/blockchain/group_vars/blockchain-setup.yaml)
* Update the respective image in `fabric_images` variable object
* Delete current Fabric via`./scripts/fabric_delete.sh`
* Install new Fabric with new images via `./scripts/fabric_setup.sh`

#### Change Fabric network size

* By Default, Fabric network consists of 2 Organisations with 2 Peers each and 1 Solo orderer
* Change the network size in file [blockchain_setup.yaml](../inventory/blockchain/group_vars/blockchain-setup.yaml) as follows:
    * Number of Orgs: `fabric_num_orgs`
    * Number of Peers per Org: `fabric_peers_per_org`
* Delete current Fabric via`./scripts/fabric_delete.sh`
* Install new Fabric with new images via `./scripts/fabric_setup.sh`

#### Change other Fabric network parameters e.g. Batch size, Orderer consensus

* The variables are defined in [blockchain_setup.yaml](../inventory/blockchain/group_vars/blockchain-setup.yaml)
* There are 2 options to change them
* Option1: Modify the values in [blockchain_setup.yaml](../inventory/blockchain/group_vars/blockchain-setup.yaml)
* Option2: Provide new value as CLI arguments to `./scripts/fabric_setup.sh` command
    * e.g To change block batch size run: `./scripts/fabric_setup.sh -e '{"fabric_batchsize":["20","256 MB","128 MB"]}'`

Benchmarking Options
-----

#### Add new chaincode for benchmarking

* Add the contract code in [contract](../inventory/blockchain/src/contract) directory. see [fabcar](../inventory/blockchain/src/contract/fabcar) and [marbles](../inventory/blockchain/src/contract/marbles) as example
* Add a benchmark for the chaincode in [benchmark](../inventory/blockchain/benchmark) directory. see [fabcar](../inventory/blockchain/benchmark/fabcar) and [marbles](../inventory/blockchain/benchmark/marbles) benchmark examples
* Define new chaincode in `chaincodes` list in the desired channel, as defined in `channels` variable, in [blockchain_setup.yaml](../inventory/blockchain/group_vars/blockchain-setup.yaml)

#### Change benchmark settings: rounds, rate controlling etc

* Each chaincode benchmark contains a file `config.yaml` which defines the testing rounds and transaction type. 
* For example: [fabcar/config.yaml](../inventory/blockchain/benchmark/fabcar/config.yaml)
* See Caliper [documentation for configuration options](https://hyperledger.github.io/caliper/docs/2_Architecture.html#configuration-file)

Extending Caliper
-----

* Use the files in the folder HyperLedgerLab/editedcaliperfiles to extend the metrics collection to include transaction failures and to use the workload generator with caliper.

Integrating Fabric++, Streamchain and FabricSharp with HyperledgerLab
-----

* Replace the original files with the corresponding files in the folders fabricplus_binaries, streamchain_binaries and fabricsharp_binaries

Common Errors
-----
1. `Error: got unexpected status: SERVICE_UNAVAILABLE -- backing Kafka cluster has not completed booting; try again later`
    * Script: `./scripts/fabric_setup.sh``
    * **Reason**: this occurs only the first time we deploy fabric network with kafka orderer on a newly created k8s cluster because all docker images need to be downloaded, which takes some time. We don't want to expose kafka on nodePort as only orderer needs access to it so we can't wait for kafka's port to open. So, we check for kafka deployment to become available but kafka takes more time to start even after deployment is available.
    * **Solution**: Rerun `./scripts/fabric_setup.sh`. It will work
2. `Python locale error: unsupported locale setting`
    * Follow this link: https://stackoverflow.com/questions/14547631/python-locale-error-unsupported-locale-setting
    * Then remove the environment first by `rm -rf venv` and then run the `k8s_setup.sh`


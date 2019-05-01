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
    * `git clone https://github.com/MSRG/HyperLedgerLab.git`
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

6. Delete Fabric Blockchain on kubernetes:
    * Run Command: `./scripts/fabric_delete.sh`
    * Estimated time to complete: **120 seconds**
    * What will happen ?
        * It will delete Fabric Blockchain on kubernetes with command: `ansible-playbook -i inventory/blockchain/hosts.ini -v blockchain_delete.yaml`
        * `crypto_config` and `channel_artifacts` will be deleted as well

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

Common Errors
-----
1. `Error: got unexpected status: SERVICE_UNAVAILABLE -- backing Kafka cluster has not completed booting; try again later`
    * Script: `./scripts/fabric_setup.sh``
    * **Reason**: this occurs only the first time we deploy fabric network with kafka orderer on a newly created k8s cluster because all docker images need to be downloaded, which takes some time. We don't want to expose kafka on nodePort as only orderer needs access to it so we can't wait for kafka's port to open. So, we check for kafka deployment to become available but kafka takes more time to start even after deployment is available.
    * **Solution**: Rerun `./scripts/fabric_setup.sh`. It will work
2. `Python locale error: unsupported locale setting`
    * Follow this link: https://stackoverflow.com/questions/14547631/python-locale-error-unsupported-locale-setting
    * Then remove the environment first by `rm -rf venv` and then run the `k8s_setup.sh`


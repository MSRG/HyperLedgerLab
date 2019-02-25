**WorkFlow**

1. Create a CLI instance in your Openstack account
    * This node will used as the access point to kubernetes and fabric network
    * SSH into it and All following commands should be executed from this node

2. Clone the repository:
    * `git clone https://github.com/MSRG/HyperLedgerLab.git`
    * `git submodule sync; git submodule update --init`

2. Create .env file with details about Openstack authentication
    * Copy `env_sample` to `.env`
    * Provide appropriate details

3. Setup kubernetes cluster
    * Check that all details are correct and match Openstack account here: `inventory/infra/group_vars/os-infra.yml`. Make modifications if required
    * Command: `./scripts/k8s_setup.sh`
    * What will happen ?
        * It will setup the python environment
        * It will create Openstack infra with command: `ansible-playbook -i inventory/infra/hosts.ini -v infra_setup.yaml`
        * It will create a kubernetes cluster with command: `ansible-playbook -i inventory/cluster/hosts.ini -v cluster_setup.yaml`

4. Delete kubernetes cluster:
    * Command: `./scripts/k8s_delete.sh`
    * What will happen ?
        * It will delete Openstack infra with command: `ansible-playbook -i inventory/infra/hosts.ini -v infra_delete.yaml`

5. Create Fabric Blockchain on kubernetes:
    * Command: `./scripts/fabric_setup.sh`
    * Be default fabric version 1.4.0 is installed.
    * To create with a CLI pod in each organisation: `./scripts/fabric_setup.sh -e fabric_create_cli=true`
    * To use kafka as Orderer consensus: `./scripts/fabric_setup.sh -e fabric_orderer_type=kafka`
    * To use fabric version 1.2.1: `./scripts/fabric_setup.sh -e fabric_version=1.2.1`
    * Other variables used in `inventory/blockchain/group_vars/blockchain_setup.yaml` can be over-ridden in same way as above
    * What will happen ?
        * It will create Fabric Blockchain on kubernetes with command: `ansible-playbook -i inventory/blockchain/hosts.ini -v blockchain_setup.yaml`
        * This will create a fabric network and a sample channel with all peers joined

6. Delete Fabric Blockchain on kubernetes:
    * Command: `./scripts/fabric_delete.sh`
    * What will happen ?
        * It will create Fabric Blockchain on kubernetes with command: `ansible-playbook -i inventory/blockchain/hosts.ini -v blockchain_delete.yaml`
        * All crypto_configs and channel_artifacts will be deleted as well

7. Get testing metrics:
    * Command: `./script/get_metrics.sh <chaincode>`
    * e.g `./script/get_metrics.sh fabcar`
    * What will happen ?
        * It will install, instantiate chaincode on the network using Caliper
        * Then it will run some rounds of testing
        * An HTML report will be created with the metrics gathered. URL will be mentioned at the end of testing
        
**Examples Fabric Metrics Workflow:**
* Create Network: `./scripts/fabric_setup.sh [args]`
* Get Metrics:  `./script/get_metrics.sh <chaincode>`
* Delete Network: `./scripts/fabric_delete.sh`
        
**Use custom Fabric images**
* Create your image (fabric, ca, tools, orderer etc) and upload to dockerhub
* Image definition can be found in file `inventory/blockchain/group_vars/blockchain_setup.yaml`
* Update the respective image in `fabric_images` dictionary
* Delete current Fabric via`./scripts/fabric_delete.sh`
* Install new Fabric with new images via `./scripts/fabric_setup.sh`

**Change Fabric network size**
* By Default, Fabric network consists of 2 Organisations with 2 Peers each and 1 Solo orderer
* Change the network size in file `inventory/blockchain/group_vars/blockchain_setup.yaml` as follows:
    * Number of Orgs: `fabric_num_orgs`
    * Number of Peers per Org: `fabric_peers_per_org`
* Delete current Fabric via`./scripts/fabric_delete.sh`
* Install new Fabric with new images via `./scripts/fabric_setup.sh`

**Change other Fabric network parameters e.g. Batch size, Orderer consensus**
* The variables are defined in `inventory/blockchain/group_vars/blockchain_setup.yaml`
* There are 2 options to change them
* Option1: Modify the values in `inventory/blockchain/group_vars/blockchain_setup.yaml`
* Option2: Provide new value as CLI arguments to `./scripts/fabric_setup.sh` command
    * e.g To change block batch size run: `./scripts/fabric_setup.sh -e '{"fabric_batchsize":["20","256 MB","128 MB"]}'`

**Add new chaincodes for testing**
* Add the contract code in `inventory/blockchain/src/<chaincode>`. see fabcar and marbles as example
* Add a benchmark for the chaincode in `inventory/blockchain/benchmark/<chaincode>`. see fabcar and marblesn benchmark examples
* Define new chaincode in `metrics_chaincodes` array variable defined in `inventory/blockchain/group_vars/blockchain_setup.yaml`

**Change Testing settings: rounds, rate controlling etc**
* Each chaincode benchmark contains a file `config.yaml` which defines the testing rounds and transaction type
* e.g. `inventory/blockchain/benchmark/fabcar/config.yaml`
* See Caliper documentation for configuration options: https://hyperledger.github.io/caliper/docs/2_Architecture.html#configuration-file

**Kubernetes Dashboard Access**
* URL: `https://<k8slb_ip_address>:8443`
* Access Token: Get from terminal via command `kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep admin-user | awk '{print $1}')`

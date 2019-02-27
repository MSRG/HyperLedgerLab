Hyperledger Testbed on Kubernetes Cluster: Automated Deployment of a Distributed Enterprise Blockchain Network for Analysis and Testing


Summary: This repository contains scripts we are developing to deploy a Hyperledger Testbed on a Kubernetes cluster, itself running on cloud resources. For the latter, we assume, resources provisioned via an OpenStack environment.

**CONTRIBUTOR**: Sahil Kalra (sahilkalra1991@gmail.com)

**CONTRIBUTOR**: Pezhman Nasirifard 

**CONTRIBUTOR**: Kaiwen Zhang 

**CONTRIBUTOR**: Arno Jacobsen


**HOW to Use ?**: See **`[docs/HowToUse.md](docs/HowToUse.md)`**


**Setup**:
1. clone the repo `git clone https://github.com/MSRG/HyperLedgerLab.git`
2. `git submodule sync; git submodule update --init`
2. `sudo apt install python-pip`
2. `pip install virtualenv`
2. `virtualenv --python=python3 venv`
3. `source venv/bin/activate`
4. `pip install -r requirements.txt`
5. `pip install -r kubespray/requirements.txt`
6. infra_setup command
7. cluster_setup command


**Environment Variables**: Set the following
* `OS_USERNAME`: Username to access Openstack cluster
* `OS_PASSWORD`: Password for the Openstack user 
* `OS_IMAGE_SSH_KEY`: Path to ssh privite key file for Openstack instances
* `INVENTORY_DIR_PATH`: Path to project's main inventory directory e.g. "$pwd/inventory"


**Configuration**:
1. Provide Openstack infrastructure details in `inventory/infra/group_vars/os-infra.yml`
2. Provide Fabric configuration in:
    * Crypto Configuration: `inventory/blockchain/fabric-config/crypto-config.yaml`
    * Network Configuration: `inventory/blockchain/fabric-config/configtx.yaml`


Supported versions: Fabric 1.2.1 and 1.4.0 are supported. `-e fabric_version=1.2.1` argument can be passed to 
blockchain_setup playbook to change the version


**Ansible Commands**:
  * **infra_setup**: `ansible-playbook -i inventory/infra/hosts.ini -v infra_setup.yaml`
    * Create OS instances
    * Creates inventory/cluster/hosts.ini
  * **infra_delete**: `ansible-playbook -i inventory/infra/hosts.ini -v infra_delete.yaml`
    * Deletes OS instances
  * **cluster_setup**: `ansible-playbook -i inventory/cluster/hosts.ini -v cluster_setup.yaml `
    * Setup nodes: DNS, LB, NFS, basic config on all
    * Creates k8s cluster using kuberspray
    * Creates inventory/blockchain/hosts.ini
  * **blockchain_setup**: `ansible-playbook -i inventory/blockchain/hosts.ini -v blockchain_setup.yaml `
    * Mount NFS on CLI node
    * Create configuration for Hyperldger Fabric on CLI node
    * Install Fabric network on kubernetes
  * **blockchain_delete**: `ansible-playbook -i inventory/blockchain/hosts.ini -v blockchain_delete.yaml `
    * Delete Fabric network from kubernetes
    * Unmount NFS on CLI node
    * Delete Fabric Configurations from CLI node

TODO: Add details How to use different fabric version ?
1. Provide binaries in hyperlegder/roles/network_config/files/bin_<version>
2. Change version to use in inventory/blockchain/group_vars/blockchain-setup.yaml
3. Provide core-<version>.yaml from https://github.com/hyperledger/fabric/blob/v1.2.1/sampleconfig/core.yaml

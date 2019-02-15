**WorkFlow**

1. Clone the repository: 
    * `git clone git@github.com:sahilkalra1991/master_thesis.git`
    * `git submodule sync; git submodule update --init`

2. Create .env file with details about Openstack auth
    * Copy `env_sample` to `.env`
    * Provide appropriate details

3. Setup kubernetes cluster
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
    * To create with a CLI pod in each organisation: `./scripts/fabric_setup.sh cli`
    * To increase wait timeout between fabric network create and channel create: `./scripts/fabric_setup.sh cli 120`
    * What will happen ?
        * It will create Fabric Blockchain on kubernetes with command: `ansible-playbook -i inventory/blockchain/hosts.ini -v blockchain_setup.yaml`
        * This will create a fabric network and a sample channel with all peers joined

6. Delete Fabric Blockchain on kubernetes:
    * Command: `./scripts/fabric_delete.sh`
    * What will happen ?
        * It will create Fabric Blockchain on kubernetes with command: `ansible-playbook -i inventory/blockchain/hosts.ini -v blockchain_delete.yaml`
        * All crypto_configs and channel_artifacts will be deleted as well

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

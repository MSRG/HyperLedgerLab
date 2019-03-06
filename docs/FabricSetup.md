Hyperledger Fabric Network Setup
================================

This is the third step in the setup process for this project.

A Hyperledger Fabric network is deployed on kubernetes cluster. This network is highly customizable and various parameters can be altered during creation time e.g. network size, fabric version etc

Each "Organisation" is matched to a "Namespace" in kubernetes. There are 2 types of organisation: Peer organisations and Orderer organisation.

Ansible is used as the automation tool.

**Code location**
- [hyperledger/roles/](../hyperledger/roles): Ansible roles for different steps performed in create fabric network and delete fabric network


Create Fabric Network
-------------

Ansible **Playbook**: [blockchain_setup.yaml](../blockchain_setup.yaml)

**Command**: `ansible-playbook -i inventory/blockchain/hosts.ini -v blockchain_setup.yaml`

**Variables**:
- Defined in file: [blockchain-setup.yaml](../inventory/blockchain/group_vars/blockchain-setup.yaml)
- Fabric binary/image:
    * `fabric_version`: Version of fabric to use, default=1.4.0
    * `fabric_ca_version`: Version of fabric ca binary, default=`fabric_version`
    * `fabric_couchdb_version`: Version of couchdb, kafka and zookeerper, default=0.4.14 
    * `fabric_images`: A dictonary defines docker images of various fabric components i.e ca, peer, tools, orderer, couchdb, kafka, zookeerper and dind
- Fabric network:
    * `fabric_create_cli`: Create a fabric cli pod in each organisation, default=`false`
    * `fabric_num_orgs`: Number of peer organisations, default=`2`
    * `fabric_peers_per_org`: Number of fabric peers per organisation, default=`2`
    * `fabric_state_db`: Database to be used a StateDB in fabric peer, default=`couchdb`. Options=`couchdb/goleveldb`
    * `fabric_orderer_type`: Type of consensus to use in orderer, default=`solo`. Options=`solo/kafka`
    * `fabric_num_kafka`: Number of kafka pods, default=`3`. Created only if `fabric_orderer_type=kafka`
    * `fabric_num_zookeeper`: Number of zookeeper pods, default=`3`. Created only if `fabric_orderer_type=kafka` 
- Fabric ledger:
    * `fabric_batch_timeout`: Batch Timeout: The amount of time to wait before creating a batch
    * `fabric_batchsize`: Batch Size: Controls the number of messages batched into a block
- Metrics config:
    * `metrics_network_file`: Location of fabric network file generated for Caliper
    * `metrics_chaincodes`: Define chaincodes which will be used in the [MetricsCollect](MetricsCollect.md) step
    * `metrics_tx_context`: Define context for all transaction of chaincodes defined in `metrics_chaincodes` above

#### How it works ?

This command will call [blockchain_setup.yaml](../blockchain_setup.yaml) playbook, which will perform 4 steps:

1. Configure Fabric: 
    * Playbook: [playbooks/configure_fabric.yaml](../playbooks/configure_fabric.yaml)
    * Role: [hyperledger/roles/network_config](../hyperledger/roles/network_config)
    1. Mount NFS server on CLI
    2. Use fabric binaries for version defined in `fabric_version`
    2. Generate [configtx.yaml](../hyperledger/roles/network_config/templates/configtx.yaml.j2) and [crypto-config.yaml](../hyperledger/roles/network_config/templates/configtx.yaml.j2)  based on fabric network variable explained above
    3. Create crypto configuration and orderer artifcats using fabric binaries "cryptogen" and "configtxgen"
    4. Copy above configuration to NFS mount
    5. Generate kubernetes templates for various resources, using [generate_k8s_configs.py](../hyperledger/roles/network_config/files/generate_k8s_configs.py) script and [k8s templates](../hyperledger/roles/network_config/templates)
    
2. Install Fabric:
    * Playbook: [playbooks/install_fabric.yaml](../playbooks/install_fabric.yaml)
    * Role: [hyperledger/roles/network_setup](../hyperledger/roles/network_setup)
    1. Deploy k8s resources for fabric componenets to the k8s cluster, using [create_k8s_blockchain.py](../hyperledger/roles/network_setup/files/create_k8s_blockchain.py) script.
3. Install a Fabric channel and join all peers to it:
    * Playbook: [playbooks/setup_fabric_channel.yaml](../playbooks/setup_fabric_channel.yaml)
    * role: [hyperledger/roles/channel_setup](../hyperledger/roles/channel_setup)
    1. Create a test channel on the fabric network deployed on k8s cluster.
    2. Add all peers to this channel.
    3. Update anchor peer for each organisation.
4. Create configuration for metrics framework: 
    * Playbook: [playbooks/create_metrics_config.yaml](../playbooks/create_metrics_config.yaml)
    * Role: [hyperledger/roles/metrics_config](../hyperledger/roles/metrics_config)
    1. Create a fabric network file for Caliper and store it in `metrics_network_file` location using template [fabric_network.json.j2](../hyperledger/roles/metrics_config/templates/fabric_network.json.j2)
        * All chaincodes to install are defined in `metrics_chaincodes` dictionary 
        * Context for all chaincode transactions is defined in `metrics_tx_context` 
        * Caliper needs this file to communicate with Fabric network. See [documentation](https://hyperledger.github.io/caliper/docs/Fabric_Configuration.html#fabric)
    
    
#### Generated configuration files

- All configuration generated for Fabric network are located in [inventory/blockchain/fabric-config](../inventory/blockchain/fabric-config) directory
- Metrics network configuration is located at `inventory/blockchain/fabric_network.json`


Delete Fabric Network
-------------

Ansible **Playbook**: [blockchain_delete.yaml](../blockchain_delete.yaml)

**Command**: `ansible-playbook -i inventory/blockchain/hosts.ini -v blockchain_delete.yaml`

**Variables**:
- Defined in file: [blockchain-setup.yaml](../inventory/blockchain/group_vars/blockchain-setup.yaml)

#### How it works ?

This command will call [blockchain_delete.yaml](../blockchain_delete.yaml) playbook, which will:
* Delete the NFS mount from CLI 
* Delete all fabric configurations generated during "Create Fabric Network"
* Delete fabric network from kubernetes cluster, using [delete_k8s_blockchain.py](../hyperledger/roles/network_setup/files/delete_k8s_blockchain.py) script.
    

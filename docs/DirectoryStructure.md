A combination of ansible, nodejs and shell scripts is used for automation of various tasks.

From a birdseye view we can separate the code into 4 different modules:
1. Ansible scripts 
2. External modules
3. Shell scripts
4. Documentation

Directory structure is as follows:
1. **[`caliper/`](../caliper)**: An external module added as a git submodule. It represents the code from [Hyperledger Caliper](https://hyperledger.github.io/caliper/) project. It is used for collecting metrics for Hyperledger Fabric.
2. **[`docs/`](../docs)**: It contains all the documentation for this project. The files in this directory have been linked in [README.md](../README.md), which provides an overview of the documentation.
3. **[`hyperleger`](../hyperledger)**: It contains ansible scripts for setting up a Hyperledger Fabric network on Kubernetes cluster. It also configures a fabric channel and provides configuration for metrics collection via Caliper.
    * [`hyperleger/roles/channel_setup`](../hyperledger/roles/channel_setup): Ansible role to set up a fabric channel and joins all peer into it.
    * [`hyperleger/roles/metrics_config`](../hyperledger/roles/metrics_config): Ansible role to provide configuration for Caliper, e.g provide fabric network definition.
    * [`hyperleger/roles/network_config`](../hyperledger/roles/network_config): Ansible role to create configuration for fabric e.g crypto-config, channel-artifacts, kubernetes templates etc.
    * [`hyperleger/roles/network_setup`](../hyperledger/roles/network_setup): Ansible role to deploy/undeploy fabric network on k8s cluster.
    * [`hyperleger/roles/prepare_cli_node`](../hyperledger/roles/prepare_cli_node): Ansible role to prepare the cli node for performing different operation e.g. modify DNS server, mount to NFS server.
4. **[`inventory/`](../inventory)**: It contains hosts and configuration for various ansible scripts.
    * [`inventory/infra`](../inventory/infra): ansible configuration for openstack playbooks
    * [`inventory/cluster`](../inventory/cluster): ansible configuration for k8s cluster playbooks
    * [`inventory/blockchain`](../inventory/blockchain): ansible configuration for hyperledger playbooks
5. **[`kubespray/`](../kubespray)**: An external module added a a git submodule. It represents the code from [kubespray](https://github.com/kubernetes-sigs/kubespray), a tool to deploy k8s cluster.
6. **[`openstack_infra/`](../openstack_infra)**; It contains ansible scripts for setting up resources in openstackc cluster. It also configures a DNS server and NFS server, which are used for k8s cluster and fabric network.
    * [`openstack_infra/roles/dns_bind9`](../openstack_infra/roles/dns_bind9): Ansible role to create a bind DNS server.
    * [`openstack_infra/roles/lb_haproxy`](../openstack_infra/roles/lb_haproxy): Ansible role to setup an haproxy tcp load-balancer.
    * [`openstack_infra/roles/nfs_server`](../openstack_infra/roles/nfs_server): Ansible role to create a NFs server, which will be used to share information between fabric peers.
    * [`openstack_infra/roles/os_instance`](../openstack_infra/roles/os_instance): Ansible role to create all Openstack instances for kubernetes cluster and DNS/NFS server.
    * [`openstack_infra/roles/prepare_instances`](../openstack_infra/roles/prepare_instances): Ansible role to perform some tasks on all created openstack instances e.g. install python, install NFS client etc.
7. **[`playbooks/`](../playbooks)**: It contains ansible sub-playbooks used by playbooks in project directory.
8. **[`scripts/`](../scripts)**: It contains shell scripts. These shell scripts automate the whole process of setting up a python or node environment and then calling respective ansible playbook or node scripts.
    
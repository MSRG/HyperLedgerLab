Infrastructure Setup
====================

This is the first step in the setup process for this project. Our project requires an infrastructure to deploy a kubernetes cluster. 

An automated creation of resources on an Openstack cluster. Ansible is used here as the automation tool

**Code location**:
- [`openstack_infra/roles/os_instance/`](../openstack_infra/roles/os_instance): Ansible role for create/delete openstack instances


Create Infrastructure
---------------------

Ansible **Playbook**: [infra_setup.yaml](../infra_setup.yaml)

**Command**: `ansible-playbook -i inventory/infra/hosts.ini -v infra_setup.yaml`

**Variables** defined in file: [os-infra.yml](../inventory/infra/group_vars/os-infra.yml)

#### How it works ?

1. This command will call [infra_setup.yaml](../infra_setup.yaml) playbook, which will execute the Ansible role [os_instance](../openstack_infra/roles/os_instance)
2. Role task [tasks/main.yaml](../openstack_infra/roles/os_instance/tasks/main.yaml) will be called and then it will call [tasks/create.yaml](../openstack_infra/roles/os_instance/tasks/create.yaml)
2. Script [openstack_instance.py](../openstack_infra/roles/os_instance/files/openstack_instance.py) will be used to create instances defined as following variables:
    * Kubernetes control nodes: `k8s_ctl_instances`
        * Flavour defined in `k8s_ctl_instance_flavour`
        * Security group defined in `k8s_instance_security_groups`
    * Kubernetes worker nodes: `k8s_wrk_instances`
        * Flavour defined in `k8s_wrk_instance_flavour`
        * Security group defined in `k8s_instance_security_groups`
    * DNS and Load-balancer node: `k8s_lb_instance`
        * Flavour defined in `k8s_instance_flavour`
        * Security group defined in `k8s_instance_dns_security_groups`
    * NFS server node: `k8s_nfs_instance`
        * Flavour defined in `k8s_instance_flavour`
        * Security group defined in `k8s_instance_nfs_security_groups`
    * Other details for instances:
        * Image name defined in `k8s_instance_image`
        * SSH key defined in `k8s_instance_image_key`
3. An ansible hosts config will be created for cluster setup with IP addresses of created instances at `inventory/cluster/hosts.ini`
    * **IMPORTANT**: This file will later be used by [ClusterSetup](ClusterSetup.md) step.
    * Template used to create this file: [cluster.hosts.ini](../openstack_infra/roles/os_instance/templates/cluster.hosts.ini.j2)
    * An example of created file can be found here: [cluster_hosts.ini](samples/cluster_hosts.ini)
4. An ansible hosts config will be created for fabric setup with IP addresses of created instances at `inventory/blockchain/hosts.ini`
    * **IMPORTANT**: This file will later be used by [FabricSetup](FabricSetup.md) step.
    * Template used to create this file: [blockchain.hosts.ini](../openstack_infra/roles/os_instance/templates/blockchain.hosts.ini.j2)
    * An example of created file can be found here: [cluster_hosts.ini](samples/blockchain_hosts.ini)
    


Delete Infrastructure
---------------------

Ansible **Playbook**: [infra_delete.yaml](../infra_delete.yaml)

**Command** to delete infrastructure: `ansible-playbook -i inventory/infra/hosts.ini -v infra_delete.yaml`

**Variables** defined in file: [os-infra.yml](../inventory/infra/group_vars/os-infra.yml)

#### How it works ?

1. This command will call [infra_delete.yaml](../infra_delete.yaml) playbook, which will execute the Ansible role [os_instance](../openstack_infra/roles/os_instance)
2. Role task [tasks/main.yaml](../openstack_infra/roles/os_instance/tasks/main.yaml) will be called and then it will call [tasks/delete.yaml](../openstack_infra/roles/os_instance/tasks/delete.yaml)
3. Script [openstack_instance.py](../openstack_infra/roles/os_instance/files/openstack_instance.py) will be used to delete instances defined as following variables:
    * Kubernetes control nodes: `k8s_ctl_instances`
    * Kubernetes worker nodes: `k8s_wrk_instances`
    * DNS and Load-balancer node: `k8s_lb_instance`
    * NFS server node: `k8s_nfs_instance`

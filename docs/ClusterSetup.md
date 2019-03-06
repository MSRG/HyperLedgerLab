Kubernetes Cluster Setup
=========================

This is the second step in the setup process for this project. A kubernetes cluster is required to deploy a hyperledger fabric network

Automation tool used: [kubespray](https://github.com/kubernetes-sigs/kubespray)
* Kubespray is a kubernetes SIG project. It automates the deployment of production ready kubernetes cluster. 
* It uses ansible as the automation tool.
* It supports [kubeadm](https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm/) deployment.

* This [customised version](https://github.com/sahilkalra1991/kubespray/tree/sk_2.6.0_xenial) of kubespray is used in this project: Official version `v2.6.0` is customised for ubuntu xenial.

Installed versions
------------------
- Kubernetes: `v1.11.3`
- Kubeadm: `v1.11.3`
- ETCD cluster: `v3.2.24`
- Weave CNI plugin: `2.4.1`
- Docker: `18.09.2`


**Code location**:
- [`kubespray/`](../kubespray): . It contains the code for external module "kubespray"
- [`openstack_infra/roles/`](../openstack_infra/roles/): Ansible roles for instance setups e.g. DNS, NFS server etc

Create Cluster
-------------

Ansible **Playbook**: [cluster_setup.yaml](../cluster_setup.yaml)

**Command**: `ansible-playbook -i inventory/cluster/hosts.ini -v cluster_setup.yaml`

**Variables**:
- Defined in file: [k8s-cluster.yml](../inventory/cluster/group_vars/k8s-cluster.yml)
- Documentation can be found [here](https://github.com/sahilkalra1991/kubespray/blob/sk_2.6.0_xenial/docs/vars.md)

#### How it works ?

This command will call [cluster_setup.yaml](../cluster_setup.yaml) playbook, which will perform 3 steps:

1. Prepare openstack instances for deployment: [playbooks/setup_instances.yaml](../playbooks/setup_instances.yaml)
    - Install python on all instances
    - Setup bind9 DNS server on instance `k8s_lb_instance` as created in [InfrastructureSetup](InfrastructureSetup.md)
    - Setup Haproxy Load-balancer on instance `k8s_lb_instance` as created in [InfrastructureSetup](InfrastructureSetup.md)
    - Setup NFS server on instance `k8s_nfs_instance` as created in [InfrastructureSetup](InfrastructureSetup.md)
    - Point DNS to created DNS server on all instances including CLI
    - Install NFS client on all instances
2. Create k8s cluster using kubespray: [kubespray/cluster.yml](../kubespray/cluster.yml)
3. Create k8s admin user and print access details to kubernetes dashboard: [playbooks/cluster_admin.yaml](../playbooks/cluster_admin.yaml)

**NOTE:** HyperLedgerLab 2.0 has been developed and is available here: [HyperledgerLab2](https://github.com/MSRG/HyperLedgerLab-2.0)

Hyperledger Testbed on Kubernetes Cluster: Automated Deployment of a Distributed Enterprise Blockchain Network for Analysis and Testing

Summary 
-------
This repository contains scripts we are developing to deploy a Hyperledger Testbed on a Kubernetes cluster, itself running on cloud resources. For the latter, we assume, resources provisioned via an OpenStack environment.


**CONTRIBUTOR**: Sahil Kalra (sahilkalra1991@gmail.com)

**CONTRIBUTOR**: Luca A. Müller

**CONTRIBUTOR**: Pezhman Nasirifard

**CONTRIBUTOR**: Jeeta Ann Chacko

**CONTRIBUTOR**: Kaiwen Zhang

**CONTRIBUTOR**: Arno Jacobsen


Quick Setup
------------

For a quick setup of this software, please see: [HowToUse](docs/HowToUse.md).

Supported Versions
-------------------

- Openstack:
    * Compute API: `v2`
    * Keystone API: `v3`
    * python-openstackclient: `>=3.16`
- Kubernetes: `v1.11.3`
- Hyperledger Fabric: `v1.2.1` and `v1.4.0`

Installation Process
-------------

This is a 4 steps process as follows:

1. [Create Infrastructure](docs/InfrastructureSetup.md)
2. [Create Kubernetes Cluster](docs/ClusterSetup.md)
3. [Create Hyperledger Fabric Network](docs/FabricSetup.md)
4. [Collect metrics on Fabric](docs/MetricsCollect.md)

**Note**: Each steps depends upon the success of previous step

Details of **one-click installation scripts**: [ShellScripts](docs/ShellScripts.md)

Project Structure
--------------

A breakdown of the code structure: [DirectoryStructure](docs/DirectoryStructure.md)

Technology Used
------------
1. [Ansible](https://www.ansible.com/): _"Simple, agentless IT automation that anyone can use"_
    * Used as an automation tool
    * Supported version  >=2.6
2. Shell scripts: 
    * Supported shell: Bash 
    * Used for setting up the environment and creating a one click installation. See [Documentation](docs/ShellScripts.md)
3. Python: supported version >=3.5
4. NodeJs: supported version 8.x
5. Operating system: 
Software has been tested on ubuntu xenial LTS (16.04)


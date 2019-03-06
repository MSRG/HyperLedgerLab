This Repository contains the code for my Master thesis.

Topic
-----

Hyperledger Testbed auf dem Kubernetes Cluster: Automatisierter Verteilung eines Verteiltes Enterprise Blockchain
Netzwerks zur Analyse

Hyperledger Testbed on Kubernetes Cluster: Automated Deployment of a Distributed Enterprise Blockchain Network for Analysis

**STUDENT**: Sahil Kalra MTK 03680993 (sahil.kalra@tum.de, sahilkalra1991@gmail.com)

**ADVISOR**: Nasirifard, Pezhman, M.Sc. https://campus.tum.de/tumonline/visitenkarte.show_vcard?pPersonenId=69107A54C9A9AFFE&pPersonenGruppe=3

**SUPERVISOR**: Jacobsen, Hans-Arno, Prof. Dr. rer. pol. https://campus.tum.de/tumonline/visitenkarte.show_vcard?pPersonenId=D04C0FA2A1AB7B18&pPersonenGruppe=3


Quick Setup
------------

For a quick setup of this software, please see: [HowToUse.md](docs/HowToUse.md)

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

There is a 4 steps process as follows:

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


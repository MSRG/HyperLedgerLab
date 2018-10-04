This Repository contains the code for my Master thesis.

Topic: Hyperledger Fabric testbed on kubernetes

Setup:
1. clone the repo `git clone git@github.com:sahilkalra1991/master_thesis.git`
2. `git submodule sync; git submodule update --init`
2. `sudo apt install python-pip`
2. `pip install virtualenv`
2. `virtualenv --python=<path-to-python3> venv`
3. `source venv/bin/activate`
4. `pip install -r requirements.txt`
5. `pip install -r kubespray/requirements.txt`

Environment Variables: Set the following
* `OS_USERNAME`: Username to access Openstack cluster
* `OS_PASSWORD`: Password for the Openstack user 
* `OS_IMAGE_SSH_KEY`: Path to ssh privite key file for Openstack instances
* `INVENTORY_DIR_PATH`: Path to inventory directory e.g. "$pwd/inventory"

Configuration:
1. Kubernetes Cluster
* Provide hosts info similar to `sample_ubuntu_xenial/hosts.ini`
* Provide Loadbalancer IP in `supplementary_addresses_in_ssl_keys` variable
* Provide Loadbalancer domain and IP in `apiserver_loadbalancer_domain_name` and `loadbalancer_apiserver.address` variables
2. 

Ansible Commands:
1. Setup cluster:
    
    `cd kubernetes-ha`
    
    `ansible-playbook -v cluster_setup.yaml`
2. Delete cluster:
    
    `cd kubernetes-ha`
    
    `ansible-playbook -v cluster_delete.yaml`

This Repository contains the code for my Master thesis.

Topic: Hyperledger Fabric testbed on kubernetes

Setup:
1. `pip instal virtualenv`
2. `virtualenv --python=<path-to-python3> venv`
3. `source venv/bin/activate`
4. `pip install -r requirements.txt`

Environment Variables: Set the following
* `OS_USERNAME`: Username to access Openstack cluster
* `OS_PASSWORD`: Password for the Openstack user 

Ansible Commands:
1. Setup cluster:
    
    `cd kubernetes-ha`
    
    `ansible-playbook -v cluster_setup.yaml`
2. Delete cluster:
    
    `cd kubernetes-ha`
    
    `ansible-playbook -v cluster_delete.yaml`

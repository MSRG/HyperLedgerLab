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
1. Create instances:
    
    `cd kubernetes-ha`
    
    `ansible-playbook -v create_instances.yaml`
2. Delete instances:
    
    `cd kubernetes-ha`
    
    `ansible-playbook -v delete_cluster.yaml`

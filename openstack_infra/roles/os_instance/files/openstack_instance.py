"""
Command Utility file to operate Openstack instances with given names
See the command usage as follows:
    python openstack_instance.py -h
"""
import os
import argparse
import time

from keystoneauth1.identity import v3
from keystoneauth1 import session
from novaclient import (
    client as nclient,
    exceptions as nexceptions
)

CREATE_ACTION = "create"
DELETE_ACTION = "delete"

def parse_cmd_line_args():
    def add_args(parser, add_instance_specs=True):
        # Required args
        parser.add_argument('server_names', metavar='Name', type=str, nargs='+', help='Name of the Instance')

        # Optional args
        # OS auth
        parser.add_argument('--os-username', action='store', dest='os_username', help='OS username')
        parser.add_argument('--os-password', action='store', dest='os_password', help='OS password')
        parser.add_argument('--os-base-url', action='store', dest='os_base_url', help='OS password')
        parser.add_argument('--os-project-domain-name', action='store', dest='os_project_domain_name',
                            help='OS password')
        parser.add_argument('--os-user-domain-name', action='store', dest='os_user_domain_name', help='OS password')
        parser.add_argument('--os-project-name', action='store', dest='os_project_name', help='OS password')

        if add_instance_specs:
            # Instance specs
            parser.add_argument('--flavour', action='store', dest='os_flavour', help="OS instance flavour to use")
            parser.add_argument('--image', action='store', dest='os_image', help="OS instance base image to use")
            parser.add_argument('--availability-zone', action='store', dest='os_availability_zone',
                                help="OS instance availability zone")
            parser.add_argument('--security-group', metavar='Group', action="append",
                                dest='os_security_groups', help="A list of OS Security groups to add in instance")
            parser.add_argument('--key', action='store', dest='os_image_key', help="OS keypair to inject in instance")

    parser_obj = argparse.ArgumentParser(description='Select an action to perform on Openstack Instances with given names')
    subparsers = parser_obj.add_subparsers(help="Action for Openstack Instances", dest="action")

    create_parser = subparsers.add_parser(CREATE_ACTION, description='Create Openstack Instances with given Names')
    add_args(create_parser)

    delete_parser = subparsers.add_parser(DELETE_ACTION, description='Delete Openstack Instances with given Names')
    add_args(delete_parser, False)

    return parser_obj.parse_args()


class MsrgComputeHelper(object):
    """
    Helper class to communicate with Openstack API
    """
    def __init__(self, nova):
        self.nova = nova

    def create_instance(
            self,
            flavor='m1.medium',
            image='kvm-ubuntu-xenial',
            server_name='started-with-api',
            availability_zone='kvm',
            security_groups=None,
            key=None
    ):
        """
        Create an Instance on Openstack
        :param flavor: flavour of Server
        :param image: Base image to use
        :param server_name: Name of the instance
        :param availability_zone: Availability zone e.g kvm
        :param key: Name of keypair to inject in instance, use default if not provided
        :param security_groups: List of security groups to attach
        :return: A tuple with following possibilities:
            True, Server Object, Ip Address
            False, Error
        """
        nflavor = self.nova.flavors.find(name=flavor)
        nimage = self.nova.glance.find_image(image)
        if key is None:
            nkeys = self.nova.keypairs.list()
            if len(nkeys) > 0:
                nkey = self.nova.keypairs.list()[0]
            else:
                raise Exception('no-key', 'no key is available in nova')
        else:
            nkey = self.nova.keypairs.get(key)

        # Create instance with given options
        newserver = self.nova.servers.create(
            server_name,
            flavor=nflavor,
            image=nimage,
            key_name=nkey.name,
            availability_zone=availability_zone,
            security_groups=security_groups
        )

        while newserver.status != "ACTIVE" and newserver.status != "ERROR":
            # Wait until server active
            # print("STATUS:", newserver.status)
            # print("WAITING FOR ACTIVE")
            time.sleep(1)
            newserver = self.nova.servers.get(newserver.id)

        if newserver.status == "ERROR":
            print("Error occurred. Deleting the instance")
            self.delete_instance_by_id(newserver.id)
            return False, newserver.to_dict()
        else:
            # Get the IP address of first interface
            interface = newserver.interface_list()[0]
            while interface.port_state != 'ACTIVE':
                time.sleep(1)
                newserver = self.nova.servers.get(newserver.id)
                interface = newserver.interface_list()[0]

            fixed_ip = interface.fixed_ips[0]
            ipaddress = fixed_ip['ip_address']
            return True, newserver, "{0}".format(ipaddress)

    def list_instances(self):
        """
        List all Instances
        :return:
        """
        return True, self.nova.servers.list()

    def delete_instance_by_id(self, server_id):
        """
        Delete an Instance by ID
        :param server_id: UUID
        :return:
        """
        try:
            return True, self.nova.servers.delete(server_id)
        except nexceptions.NotFound:
            return False, "Instance not found with id: {}".format(server_id)
        except Exception as e:
            return False, "Some exception occurred: {}".format(e)

    def delete_instances_by_name(self, *server_names):
        """
        Delete all instances with given Names
        :param server_names: Name(s) of Instance(s)
        :return:
        """
        instances = self.list_instances()
        if not instances[0]:
            return False, "Error while fetching instances"

        result_str = ""
        for instance in instances[1]:
            if instance.name in server_names:
                result = self.delete_instance_by_id(instance.id)
                if not result[0]:
                    result_str += "\nError: {}".format(result[1])
                else:
                    result_str += "\nDeleted name: {0} with ID: {1}".format(instance.name, instance.id)
        return True, result_str if bool(result_str) else "Server(s) not found with given name(s): {}".format(server_names)

    def get_instance_by_id(self, server_id):
        """
        Return Server Object by ID
        :param server_id: UUID
        :return:
        """
        try:
            return True, self.nova.servers.get(server_id)
        except nexceptions.NotFound:
            return False, "Instance not found with id: {}".format(server_id)
        except Exception as e:
            return False, "Some exception occurred: {}".format(e)

    def get_instance_by_name(self, server_name):
        """
        Return Server Object by Name
        :param server_name: Name
        :return:
        """
        instances = self.list_instances()
        if not instances[0]:
            return False, "Error while fetching instances"

        for instance in instances[1]:
            if instance.name == server_name:
                return True, instance

        return False, "Not found"


def create_msrg_compute_helper(
        os_username,
        os_password,
        os_base_url="https://openstack.cluster.msrg.in.tum.de",
        os_project_name=None,
        os_project_domain_name="default",
        os_user_domain_name="default",
):
    """
    Authnticate with Openstack and return MsrgComputeHelper object
    :param os_username: Openstack Username
    :param os_password: Openstack Password
    :param os_base_url: Base URL for Access. Over-ride in API
    :param os_project_domain_name: Project domain name
    :param os_user_domain_name: User domain name
    :param os_project_name: Name of the Openstack project
    :return: MsrgComputeHelper object
    """
    if not os_username or not os_password:
        raise Exception("Please provide OS_USERNAME and OS_PASSWORD")

    auth = v3.Password(auth_url='{}:5000/v3/'.format(os_base_url),
                       username=os_username,
                       password=os_password,
                       project_name=os_project_name,
                       project_domain_name=os_project_domain_name,
                       user_domain_name=os_user_domain_name)
    sess = session.Session(auth=auth)
    nova_client = nclient.Client(2, session=sess, endpoint_override='{}:8774/v2.1/'.format(os_base_url))
    n2 = nclient.Client(2, session=sess, endpoint_override='{}:9292'.format(os_base_url))
    nova_client.glance = n2.glance

    return MsrgComputeHelper(nova_client)


def create_instances(os_helper, kwargs):
    """
    Command Utility file to create Openstack instances with given names
    See the command usage as follows:
        python openstack_instance.py create -h
    """
    success = True
    for server_name in kwargs.server_names:
        # Check if instance exists with given name
        result = os_helper.get_instance_by_name(server_name)
        if not result[0]:
            # Create Instance if doesn't exist
            result = os_helper.create_instance(
                server_name=server_name,
                flavor=kwargs.os_flavour or 'm1.medium',
                image=kwargs.os_image or 'kvm-ubuntu-xenial',
                availability_zone=kwargs.os_availability_zone or 'kvm',
                security_groups=kwargs.os_security_groups or ["kube-cluster"],
                key=kwargs.os_image_key
            )
            if result[0]:
                print("{0},{1}".format(server_name, result[2]))
            else:
                # Mark command fail if any instance fails
                success = False
                print("Failure: {1} {0}".format(result[1], server_name))
        else:
            print("Failure: Instance with name {} already exists".format(server_name))

    exit(0 if success else 1)

def delete_instances(os_helper, kwargs):
    """
    Command Utility file to delete Openstack instances with given names
    See the command usage as follows:
        python openstack_instance.py delete -h
    """
    result = os_helper.delete_instances_by_name(*kwargs.server_names)
    if result[0]:
        print("Success: {0}".format(result[1]))
        exit(0)
    else:
        print("Failure: {0}".format(result[1]))
        exit(1)

if __name__ == "__main__":
    kwargs_obj = parse_cmd_line_args()
    os_helper_obj = create_msrg_compute_helper(
        os_username=kwargs_obj.os_username or os.environ.get('OS_USERNAME'),
        os_password=kwargs_obj.os_password or os.environ.get('OS_PASSWORD'),
        os_base_url=kwargs_obj.os_base_url or os.environ.get('OS_BASE_URL') or "https://openstack.cluster.msrg.in.tum.de",
        os_project_name=kwargs_obj.os_project_name or os.environ.get('OS_PROJECT_NAME'),
        os_project_domain_name=kwargs_obj.os_project_domain_name or os.environ.get('OS_PROJECT_DOMAIN_NAME') or "default",
        os_user_domain_name=kwargs_obj.os_user_domain_name or os.environ.get('OS_USER_DOMAIN_NAME') or "default"
    )

    if kwargs_obj.action == CREATE_ACTION:
        create_instances(os_helper_obj, kwargs_obj)
    elif kwargs_obj.action == DELETE_ACTION:
        delete_instances(os_helper_obj, kwargs_obj)
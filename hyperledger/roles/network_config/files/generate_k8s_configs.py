import os
import argparse
import re
from string import Template

# To be set via command line args
CRYPTO_CONFIG_DIR = None
TEMPLATES_DIR = None
ORDERER = None
PEER = None

PORT_START_FROM = 30000
GAP = 100  # interval for worker's port

NODEPORT_SERVICE_PORTS = {}


def dns_name(name):
    """
    Convert string to dns-name compatible string
    """
    return re.sub(r'[^a-zA-Z0-9-]+', '-', name)


def parse_cmd_line_args():
    """
    Command line arguments
    """

    def add_args(parser):
        # Required args
        parser.add_argument('crypto_config_dir', metavar='CryptoDir', type=str, nargs=1,
                            help='Path to crypto config directory')
        parser.add_argument('templates_dir', metavar='TemplatesDir', type=str, nargs=1,
                            help='Path to kubernetes pod templates directory')

    parser_obj = argparse.ArgumentParser(description='Generate Kubernetes configs for peers and orderers')
    add_args(parser_obj)
    return parser_obj.parse_args()


def set_global_vars(crypto_config_dir, templates_dir):
    """
    Set global variables from values from command line
    """
    global CRYPTO_CONFIG_DIR, TEMPLATES_DIR, ORDERER, PEER
    CRYPTO_CONFIG_DIR = crypto_config_dir
    TEMPLATES_DIR = templates_dir
    ORDERER = os.path.join(CRYPTO_CONFIG_DIR, "ordererOrganizations")
    PEER = os.path.join(CRYPTO_CONFIG_DIR, "peerOrganizations")


# ###########################################
# ########## CONFIG.PY START ################
# ###########################################

def render(src, dest, **kw):
    t = Template(open(src, 'r').read())
    with open(dest, 'w') as f:
        f.write(t.substitute(**kw))


def get_template(template_name):
    """
    Return a the path to template with name template_name
    """
    return os.path.join(TEMPLATES_DIR + "/" + template_name)


def config_orgs(org_name, org_crypto_dir_path):
    """
    Create organisation namespace, CLI and CA/MSP
    :param org_name: Name of organisation
    :param org_crypto_dir_path: path to the organisation directory, where namespace.yaml is created
    :return: None
    """
    is_peer = org_crypto_dir_path.find("peer") != -1
    if is_peer:
        namespace_template = get_template("fabric_template_peer_org_namespace.yaml")
    else:
        namespace_template = get_template("fabric_template_orderer_org_namespace.yaml")


    render(namespace_template, "{0}/{1}-namespace.yaml".format(org_crypto_dir_path, org_name),
           org=dns_name(org_name),
           pvName="{0}-pv".format(org_name),
           mountPath="/opt/share/crypto-config{0}".format(org_crypto_dir_path.split("crypto-config")[-1])
           )

    if is_peer:
        # ###### pod config yaml for org cli
        cli_template = get_template("fabric_template_pod_cli.yaml")

        msp_path_template = 'users/Admin@{0}/msp'

        render(cli_template, "{0}/{1}-cli.yaml".format(org_crypto_dir_path, org_name),
               name="cli",
               orgName=org_name,
               namespace=dns_name(org_name),
               mspPath=msp_path_template.format(org_name),
               pvName="{0}-pv".format(org_name),
               artifactsName="{0}-artifacts-pv".format(org_name),
               cryptoName="{0}-crypto-pv".format(org_name),
               peerAddress="peer0.{0}:7051".format(dns_name(org_name)),
               mspid="{0}MSP".format(org_name.split('-')[0].capitalize())
               )

        # ###### pod config yaml for org ca
        # Need to expose pod's port to worker ! ####
        address_segment = (int(org_name.split("-")[0].split("org")[-1].split(".")[0]) - 1) * GAP
        exposed_port = PORT_START_FROM + address_segment
        # Add the NodePort exposed ports mapping
        NODEPORT_SERVICE_PORTS["ca.{}".format(org_name)] = {
            "7054": exposed_port
        }

        ca_template = get_template("fabric_template_pod_ca.yaml")

        tls_cert_template = '/etc/hyperledger/fabric-ca-server-config/{}-cert.pem'
        tls_key_template = '/etc/hyperledger/fabric-ca-server-config/{}'
        ca_path_template = 'ca/'
        cmd_template = 'fabric-ca-server start --ca.certfile /etc/hyperledger/fabric-ca-server-config/{0}-cert.pem --ca.keyfile /etc/hyperledger/fabric-ca-server-config/{1} -b admin:adminpw -d '

        sk_file = ""
        for f in os.listdir(org_crypto_dir_path + "/ca"):  # find out sk!
            if f.endswith("_sk"):
                sk_file = f

        render(ca_template, "{0}/{1}-ca.yaml".format(org_crypto_dir_path, org_name),
               namespace=dns_name(org_name),
               command='"' + cmd_template.format("ca." + org_name, sk_file) + '"',
               caPath=ca_path_template,
               tlsKey=tls_key_template.format(sk_file),
               tlsCert=tls_cert_template.format("ca." + org_name),
               nodePort=exposed_port,
               pvName="{0}-pv".format(org_name)
               )


def generate_yaml(member, memberPath, flag):
    if flag == "/peers":
        config_peers(member, memberPath)
    else:
        config_orderers(member, memberPath)


# create peer/pod
def config_peers(name, path):  # name means peerid.
    config_template = get_template("fabric_template_pod_peer.yaml")

    msp_path_template = 'peers/{0}/msp'
    tls_path_template = 'peers/{0}/tls'
    name_split = name.split(".", 1)
    peer_name = name_split[0]
    org_name = name_split[1]

    address_segment = (int(org_name.split("-")[0].split("org")[-1].split(".")[0]) - 1) * GAP
    # peer from like this peer 0##
    peer_offset = int((peer_name.split("peer")[-1])) * 3
    exposed_port1 = PORT_START_FROM + address_segment + peer_offset + 1
    exposed_port2 = PORT_START_FROM + address_segment + peer_offset + 2
    exposed_port3 = PORT_START_FROM + address_segment + peer_offset + 3
    # Add the NodePort exposed ports mapping
    NODEPORT_SERVICE_PORTS[name] = {
        "7051": exposed_port1,
        "7052": exposed_port2,
        "7053": exposed_port3
    }

    render(config_template, path + "/" + name + ".yaml",
           namespace=dns_name(org_name),
           podName=dns_name(peer_name + "-" + org_name),
           peerID=dns_name(peer_name),
           org=org_name,
           corePeerID=name,
           peerAddress=name + ":7051",
           peerGossip=name + ":7051",
           localMSPID=org_name.split('-')[0].capitalize() + "MSP",
           mspPath=msp_path_template.format(name),
           tlsPath=tls_path_template.format(name),
           nodePort1=exposed_port1,
           nodePort2=exposed_port2,
           nodePort3=exposed_port3,
           pvName="{0}-pv".format(org_name)
           )


# create orderer/pod
def config_orderers(name, path):  # name means ordererid
    config_template = get_template("fabric_template_pod_orderer.yaml")

    msp_path_template = 'orderers/{0}/msp'
    tls_path_template = 'orderers/{0}/tls'

    name_split = name.split(".", 1)
    orderer_name = name_split[0]
    org_name = name_split[1]

    exposed_port = 32000 + int(orderer_name.split("orderer")[-1] if orderer_name.split("orderer")[-1] != '' else 0)
    # Add the NodePort exposed ports mapping
    NODEPORT_SERVICE_PORTS[name] = {
        "7050": exposed_port
    }

    render(config_template, path + "/" + name + ".yaml",
           namespace=dns_name(org_name),
           ordererID=dns_name(orderer_name),
           podName=dns_name(orderer_name + "-" + org_name),
           localMSPID=org_name.capitalize() + "MSP",
           mspPath=msp_path_template.format(name),
           tlsPath=tls_path_template.format(name),
           nodePort=exposed_port,
           pvName=org_name + "-pv"
           )


# ###########################################
# ########## GENERATE.PY START ################
# ###########################################

def generate_namespace_pod(dir):
    """
    I generate the yaml file to create the namespace for k8s, and return a set of paths which
    indicate the location of org files
    :param dir: Directory which contains peer organisations or orderer organisations inside crypto config
    :return: Path to all organisations in dir e.g. [<dir>/org1, <dir>/org2]
    """
    orgs = []
    for org in os.listdir(dir):
        org_dir = os.path.join(dir, org)
        # generate namespace first
        config_orgs(org, org_dir)
        orgs.append(org_dir)

    return orgs


def generate_deployment_pod(orgs):
    for org in orgs:

        if org.find("peer") != -1:  # whether it create orderer pod or peer pod
            suffix = "/peers"
        else:
            suffix = "/orderers"

        members = os.listdir(org + suffix)
        for member in members:
            member_dir = os.path.join(org + suffix, member)
            generate_yaml(member, member_dir, suffix)


def generate_all_configs():
    peer_orgs = generate_namespace_pod(PEER)
    generate_deployment_pod(peer_orgs)

    orderer_orgs = generate_namespace_pod(ORDERER)
    generate_deployment_pod(orderer_orgs)


if __name__ == "__main__":
    kwargs_obj = parse_cmd_line_args()

    set_global_vars(kwargs_obj.crypto_config_dir[0], kwargs_obj.templates_dir[0])

    generate_all_configs()
    # print to stdout so NodePort Service mapping can be stored can be stored
    print(NODEPORT_SERVICE_PORTS)

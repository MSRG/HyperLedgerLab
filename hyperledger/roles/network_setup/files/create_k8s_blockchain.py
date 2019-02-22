import os
import argparse

ORDERER = None  # it must point to the ordererOrganizations dir
PEER = None  # it must point to the peerOrganizations dir
KUBECTL = None # Kubectl command to use to access kubernetes
CREATE_CLI = True  # Whether to create CLI Pod or not
CREATE_KAFKA = False  # Whether to create Kafka Setup or not

def parse_cmd_line_args():
    """
    Command line arguments
    """

    def add_args(parser):
        # Required args
        parser.add_argument('crypto_config_dir', metavar='CryptoDir', type=str, nargs=1,
                            help='Path to cryto config directory')

        parser.add_argument('kubectl_cmd', metavar='Kubectl', type=str, nargs=1,
                            help='Kubectl command to use to access kubernetes')

        parser.add_argument('--no-cli', action='store_false', dest='create_cli',
                            help='Do not create CLI (fabric-tools) Pod')

        parser.add_argument('--kafka', action='store_true', dest='create_kafka',
                            help='Create Kafka Setup for Orderer Consensus')

    parser_obj = argparse.ArgumentParser(description='Create Kubernetes pods for peers and orderers')
    add_args(parser_obj)
    return parser_obj.parse_args()


def set_global_vars(crypto_config_dir, kubectl_cmd, create_cli, create_kafka):
    """
    Set global variables from values from command line
    """
    global ORDERER, PEER, KUBECTL, CREATE_CLI, CREATE_KAFKA
    ORDERER = os.path.join(crypto_config_dir, "./ordererOrganizations")
    PEER = os.path.join(crypto_config_dir, "./peerOrganizations")
    KUBECTL = kubectl_cmd
    CREATE_CLI = create_cli
    CREATE_KAFKA = create_kafka


def kubernetes_create(f):
    """
    kubectl apply command
    :param f: path to kubernetes config to apply
    :return: None
    """
    if os.path.isfile(f):
        os.system(KUBECTL + " apply -f " + f)

    else:
        print("file %s no exited" % (f))


def create_orderers(path):
    """
    Create Orderer org Namespaces
    Create Orderer Deployment
    Create Kafka deployment if specified
    :param path: path to crypto-config/ordererOrganizations path
    :return: None
    """
    orgs = os.listdir(path)
    for org in orgs:
        org_path = os.path.join(path, org)
        namespace_yaml = os.path.join(org_path, org + "-namespace.yaml")
        kubernetes_create(namespace_yaml)

        for orderer in os.listdir(org_path + "/orderers"):
            orderer_path = os.path.join(org_path + "/orderers", orderer)
            orderer_yaml = os.path.join(orderer_path, "{0}.yaml".format(orderer))
            kubernetes_create(orderer_yaml)
            if CREATE_KAFKA:
                # Create kafka setup
                kubernetes_create(os.path.join(orderer_path, "{0}-kafka.yaml".format(orderer)))


def create_peers(path):
    """
    Create Peer org Namespaces
    Create MSP/CA pods
    Create CLI pods
    Create Peer pods
    :param path: path to crypto-config/peerOrganizations path
    :return: None
    """
    orgs = os.listdir(path)
    for org in orgs:
        org_path = os.path.join(path, org)

        namespace_yaml = os.path.join(org_path, org + "-namespace.yaml")
        kubernetes_create(namespace_yaml)

        ca_yaml = os.path.join(org_path, org + "-ca.yaml")
        kubernetes_create(ca_yaml)

        if CREATE_CLI:
            cli_yaml = os.path.join(org_path, org + "-cli.yaml")
            kubernetes_create(cli_yaml)

        for peer in os.listdir(org_path + "/peers"):
            peer_path = os.path.join(org_path + "/peers", peer)
            peer_yaml = os.path.join(peer_path, peer + ".yaml")
            kubernetes_create(peer_yaml)


if __name__ == "__main__":
    kwargs_obj = parse_cmd_line_args()
    set_global_vars(kwargs_obj.crypto_config_dir[0], kwargs_obj.kubectl_cmd[0],
                    kwargs_obj.create_cli, kwargs_obj.create_kafka)

    create_orderers(ORDERER)
    create_peers(PEER)

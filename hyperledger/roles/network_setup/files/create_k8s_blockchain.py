import os
import argparse

ORDERER = None  # it must point to the ordererOrganizations dir
PEER = None  # it must point to the peerOrganizations dir
KUBECTL = None # Kubectl command to use to access kubernetes
CREATE_CLI = True  # Whether to create CLI Pod or not

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

        parser.add_argument('--no-cli', action='store_false', dest='create_cli', help='Do not create CLI (fabric-tools) Pod')

    parser_obj = argparse.ArgumentParser(description='Create Kubernetes pods for peers and orderers')
    add_args(parser_obj)
    return parser_obj.parse_args()


def set_global_vars(crypto_config_dir, kubectl_cmd, create_cli):
    """
    Set global variables from values from command line
    """
    global ORDERER, PEER, KUBECTL, CREATE_CLI
    ORDERER = os.path.join(crypto_config_dir, "./ordererOrganizations")
    PEER = os.path.join(crypto_config_dir, "./peerOrganizations")
    KUBECTL = kubectl_cmd
    CREATE_CLI = create_cli


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
    Create Orderer
    :param path: path to crypto-config/ordererOrganizations path
    :return: None
    """
    orgs = os.listdir(path)
    for org in orgs:
        orgPath = os.path.join(path, org)
        namespaceYaml = os.path.join(orgPath, org + "-namespace.yaml")
        kubernetes_create(namespaceYaml)

        for orderer in os.listdir(orgPath + "/orderers"):
            ordererPath = os.path.join(orgPath + "/orderers", orderer)
            ordererYaml = os.path.join(ordererPath, orderer + ".yaml")
            kubernetes_create(ordererYaml)


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
        orgPath = os.path.join(path, org)

        namespace_yaml = os.path.join(orgPath, org + "-namespace.yaml")
        kubernetes_create(namespace_yaml)

        ca_yaml = os.path.join(orgPath, org + "-ca.yaml")
        kubernetes_create(ca_yaml)

        if CREATE_CLI:
            cli_yaml = os.path.join(orgPath, org + "-cli.yaml")
            kubernetes_create(cli_yaml)

        for peer in os.listdir(orgPath + "/peers"):
            peerPath = os.path.join(orgPath + "/peers", peer)
            peerYaml = os.path.join(peerPath, peer + ".yaml")
            kubernetes_create(peerYaml)


if __name__ == "__main__":
    kwargs_obj = parse_cmd_line_args()
    set_global_vars(kwargs_obj.crypto_config_dir[0], kwargs_obj.kubectl_cmd[0], kwargs_obj.create_cli)

    create_orderers(ORDERER)
    create_peers(PEER)

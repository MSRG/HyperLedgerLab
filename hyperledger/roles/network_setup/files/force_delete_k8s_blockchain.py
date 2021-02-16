import os
import argparse
import time

ORDERER = None  # it must point to the ordererOrganizations dir
PEER = None  # it must point to the peerOrganizations dir
KUBECTL = None # Kubectl command to use to access kubernetes


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

    parser_obj = argparse.ArgumentParser(description='Delete Kubernetes pods for peers and orderers')
    add_args(parser_obj)
    return parser_obj.parse_args()


def set_global_vars(crypto_config_dir, kubectl_cmd):
    """
    Set global variables from values from command line
    """
    global ORDERER, PEER, KUBECTL
    ORDERER = os.path.join(crypto_config_dir, "./ordererOrganizations")
    PEER = os.path.join(crypto_config_dir, "./peerOrganizations")
    KUBECTL = kubectl_cmd


def kubernetes_delete(f):
    """
    kubectl delete command
    :param f: path to kubernetes config to delete
    :return: None
    """
    if os.path.isfile(f):
        os.system(KUBECTL + " delete -f " + f + " --wait=false ")

def kubernetes_force_delete():
   """time.sleep(120)"""
   os.system(KUBECTL + " delete --all pods --namespace=org1 --grace-period=0 --force")
   os.system(KUBECTL + " delete --all pods --namespace=org2 --grace-period=0 --force")
   os.system(KUBECTL + " delete --all pods --namespace=org3 --grace-period=0 --force")
   os.system(KUBECTL + " delete --all pods --namespace=org4 --grace-period=0 --force")
   os.system(KUBECTL + " delete --all pods --namespace=org5 --grace-period=0 --force")
   os.system(KUBECTL + " delete --all pods --namespace=org6 --grace-period=0 --force")
   os.system(KUBECTL + " delete --all pods --namespace=org7 --grace-period=0 --force")
   os.system(KUBECTL + " delete --all pods --namespace=org8 --grace-period=0 --force")
   os.system(KUBECTL + " delete --all pods --namespace=orgorderer1 --grace-period=0 --force")
   time.sleep(10)
   os.system(KUBECTL + " delete namespace org1")
   os.system(KUBECTL + " delete namespace org2")
   os.system(KUBECTL + " delete namespace org3")
   os.system(KUBECTL + " delete namespace org4")
   os.system(KUBECTL + " delete namespace org5")
   os.system(KUBECTL + " delete namespace org6")
   os.system(KUBECTL + " delete namespace org7")
   os.system(KUBECTL + " delete namespace org8")
   os.system(KUBECTL + " delete namespace orgorderer1")
   time.sleep(10)


def delete_orderers(path):
    """
    Delete Orderers
    Delete Orderer org Namespaces
    :param path: path to crypto-config/ordererOrganizations path
    :return: None
    """
    orgs = os.listdir(path)
    for org in orgs:
        org_path = os.path.join(path, org)
        namespace_yaml = os.path.join(org_path, org + "-namespace.yaml")  # orgYaml namespace.yaml

        for orderer in os.listdir(org_path + "/orderers"):
            orderer_path = os.path.join(org_path + "/orderers", orderer)
            orderer_yaml = os.path.join(orderer_path, orderer + ".yaml")
            kubernetes_delete(orderer_yaml)

        kubernetes_delete(namespace_yaml)


def delete_peers(path):
    """
    Delete Peer pods
    Delete CLI pods
    Delete MSP/CA pods
    Delete Peer org Namespaces
    :param path: path to crypto-config/peerOrganizations path
    :return: None
    """
    orgs = os.listdir(path)
    for org in orgs:
        org_path = os.path.join(path, org)

        namespace_yaml = os.path.join(org_path, org + "-namespace.yaml")  # namespace.yaml
        ca_yaml = os.path.join(org_path, org + "-ca.yaml")  # ca.yaml
        cli_yaml = os.path.join(org_path, org + "-cli.yaml")  # cli.yaml

        for peer in os.listdir(org_path + "/peers"):
            peer_path = os.path.join(org_path + "/peers", peer)
            peer_yaml = os.path.join(peer_path, peer + ".yaml")
            kubernetes_delete(peer_yaml)

        kubernetes_delete(cli_yaml)
        kubernetes_delete(ca_yaml)
        kubernetes_delete(namespace_yaml)


if __name__ == "__main__":
    kwargs_obj = parse_cmd_line_args()
    set_global_vars(kwargs_obj.crypto_config_dir[0], kwargs_obj.kubectl_cmd[0])

    delete_orderers(ORDERER)
    delete_peers(PEER)
    kubernetes_force_delete()


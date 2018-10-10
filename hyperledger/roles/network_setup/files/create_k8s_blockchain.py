import os
import argparse

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

    parser_obj = argparse.ArgumentParser(description='Create Kubernetes pods for peers and orderers')
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

### order of run ###

#### orderer
##### namespace(org)
###### single orderer

#### peer
##### namespace(org)
###### ca
####### single peer

def runOrderers(path):
    orgs = os.listdir(path)
    for org in orgs:
        orgPath = os.path.join(path, org)
        namespaceYaml = os.path.join(orgPath, org + "-namespace.yaml")  # orgYaml namespace.yaml
        checkAndRun(namespaceYaml)

        for orderer in os.listdir(orgPath + "/orderers"):
            ordererPath = os.path.join(orgPath + "/orderers", orderer)
            ordererYaml = os.path.join(ordererPath, orderer + ".yaml")
            checkAndRun(ordererYaml)


def runPeers(path):
    orgs = os.listdir(path)
    for org in orgs:
        orgPath = os.path.join(path, org)

        namespaceYaml = os.path.join(orgPath, org + "-namespace.yaml")  # namespace.yaml
        checkAndRun(namespaceYaml)

        caYaml = os.path.join(orgPath, org + "-ca.yaml")  # namespace.yaml
        checkAndRun(caYaml)

        cliYaml = os.path.join(orgPath, org + "-cli.yaml")  # namespace.yaml
        checkAndRun(cliYaml)

        for peer in os.listdir(orgPath + "/peers"):
            peerPath = os.path.join(orgPath + "/peers", peer)
            peerYaml = os.path.join(peerPath, peer + ".yaml")
            checkAndRun(peerYaml)


def checkAndRun(f):
    if os.path.isfile(f):
        os.system(KUBECTL + " apply -f " + f)

    else:
        print("file %s no exited" % (f))


if __name__ == "__main__":
    kwargs_obj = parse_cmd_line_args()
    set_global_vars(kwargs_obj.crypto_config_dir[0], kwargs_obj.kubectl_cmd[0])

    runOrderers(ORDERER)
    runPeers(PEER)

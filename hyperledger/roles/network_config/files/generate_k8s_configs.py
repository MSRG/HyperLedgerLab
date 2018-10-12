import os
import sys
import argparse
from string import Template

# To be set via command line args
CRYPTO_CONFIG_DIR = None
TEMPLATES_DIR = None
ORDERER = None
PEER = None

PORTSTARTFROM = 30000
GAP = 100  # interval for worker's port


def parse_cmd_line_args():
    """
    Command line arguments
    """
    def add_args(parser):
        # Required args
        parser.add_argument('crypto_config_dir', metavar='CryptoDir', type=str, nargs=1, help='Path to cryto config directory')
        parser.add_argument('templates_dir', metavar='TemplatesDir', type=str, nargs=1, help='Path to kubernetes pod templates directory')

    parser_obj =  argparse.ArgumentParser(description='Generate Kubernetes configs for peers and orderers')
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

############################################
########### CONFIG.PY START ################
############################################

def render(src, dest, **kw):
    t = Template(open(src, 'r').read())
    with open(dest, 'w') as f:
        f.write(t.substitute(**kw))


# #### For testing ########################
# #testDest = dest.split("/")[-1]	##
# #with open(TestDir+testDest, 'w') as d:##
# #d.write(t.substitute(**kw))      	##
# #########################################
def getTemplate(templateName):
    configTemplate = os.path.join(TEMPLATES_DIR + "/" + templateName)
    return configTemplate


# create org/namespace
def configORGS(name, path):  # name means if of org, path describe where is the namespace yaml to be created.
    namespaceTemplate = getTemplate("fabric_template_namespace.yaml")

    render(namespaceTemplate, path + "/" + name + "-namespace.yaml", org=name,
           pvName=name + "-pv",
           path= "/opt/share/crypto-config{0}".format(path.split("crypto-config")[-1])
           )

    if path.find("peer") != -1:
        ####### pod config yaml for org cli
        cliTemplate = getTemplate("fabric_template_pod_cli.yaml")

        mspPathTemplate = 'users/Admin@{}/msp'

        render(cliTemplate, path + "/" + name + "-cli.yaml", name="cli",
               namespace=name,
               mspPath=mspPathTemplate.format(name),
               pvName=name + "-pv",
               artifactsName=name + "-artifacts-pv",
               peerAddress="peer0." + name + ":7051",
               mspid=name.split('-')[0].capitalize() + "MSP",
               )
        #######

        ####### pod config yaml for org ca

        ###Need to expose pod's port to worker ! ####
        ##org format like this org1-f-1##
        addressSegment = (int(name.split("-")[0].split("org")[-1].split(".")[0]) - 1) * GAP
        exposedPort = PORTSTARTFROM + addressSegment

        caTemplate = getTemplate("fabric_template_pod_ca.yaml")

        tlsCertTemplate = '/etc/hyperledger/fabric-ca-server-config/{}-cert.pem'
        tlsKeyTemplate = '/etc/hyperledger/fabric-ca-server-config/{}'
        caPathTemplate = 'ca/'
        cmdTemplate = ' fabric-ca-server start --ca.certfile /etc/hyperledger/fabric-ca-server-config/{}-cert.pem --ca.keyfile /etc/hyperledger/fabric-ca-server-config/{} -b admin:adminpw -d '

        skFile = ""
        for f in os.listdir(path + "/ca"):  # find out sk!
            if f.endswith("_sk"):
                skFile = f

        render(caTemplate, path + "/" + name + "-ca.yaml", namespace=name,
               command='"' + cmdTemplate.format("ca." + name, skFile) + '"',
               caPath=caPathTemplate,
               tlsKey=tlsKeyTemplate.format(skFile),
               tlsCert=tlsCertTemplate.format("ca." + name),
               nodePort=exposedPort,
               pvName=name + "-pv"
               )


#######

def generateYaml(member, memberPath, flag):
    if flag == "/peers":
        configPEERS(member, memberPath)
    else:
        configORDERERS(member, memberPath)


# create peer/pod
def configPEERS(name, path):  # name means peerid.
    configTemplate = getTemplate("fabric_template_pod_peer.yaml")

    mspPathTemplate = 'peers/{}/msp'
    tlsPathTemplate = 'peers/{}/tls'
    # mspPathTemplate = './msp'
    # tlsPathTemplate = './tls'
    nameSplit = name.split(".", 1)
    peerName = nameSplit[0]
    orgName = nameSplit[1]

    addressSegment = (int(orgName.split("-")[0].split("org")[-1].split(".")[0]) - 1) * GAP
    ##peer from like this peer 0##
    peerOffset = int((peerName.split("peer")[-1])) * 2
    exposedPort1 = PORTSTARTFROM + addressSegment + peerOffset + 1
    exposedPort2 = PORTSTARTFROM + addressSegment + peerOffset + 2

    render(configTemplate, path + "/" + name + ".yaml",
           namespace=orgName,
           podName=peerName + "-" + orgName,
           peerID=peerName,
           org=orgName,
           corePeerID=name,
           peerAddress=name + ":7051",
           peerGossip=name + ":7051",
           localMSPID=orgName.split('-')[0].capitalize() + "MSP",
           mspPath=mspPathTemplate.format(name),
           tlsPath=tlsPathTemplate.format(name),
           nodePort1=exposedPort1,
           nodePort2=exposedPort2,
           pvName=orgName + "-pv"
           )


# create orderer/pod
def configORDERERS(name, path):  # name means ordererid
    configTemplate = getTemplate("fabric_template_pod_orderer.yaml")

    mspPathTemplate = 'orderers/{}/msp'
    tlsPathTemplate = 'orderers/{}/tls'

    nameSplit = name.split(".", 1)
    ordererName = nameSplit[0]
    orgName = nameSplit[1]

    exposedPort = 32000 + int(ordererName.split("orderer")[-1] if ordererName.split("orderer")[-1] != ''  else 0)

    render(configTemplate, path + "/" + name + ".yaml",
           namespace=orgName,
           ordererID=ordererName,
           podName=ordererName + "-" + orgName,
           localMSPID=orgName.capitalize() + "MSP",
           mspPath=mspPathTemplate.format(name),
           tlsPath=tlsPathTemplate.format(name),
           nodePort=exposedPort,
           pvName=orgName + "-pv"
           )


# if __name__ == "__main__":
#	#ORG_NUMBER = 3
#	podFile = Path('./fabric_cluster.yaml')
#	if podFile.is_file():
#		os.remove('./fabric_cluster.yaml')

# delete the previous exited file
#	configPeerORGS(1, 2)
#	configPeerORGS(2, 2)
#	configOrdererORGS()


############################################
########### GENERATE.PY START ################
############################################

# generateNamespacePod generate the yaml file to create the namespace for k8s, and return a set of paths which
# indicate the location of org files
def generateNamespacePod(DIR):
    orgs = []
    for org in os.listdir(DIR):
        orgDIR = os.path.join(DIR, org)
        ## generate namespace first.
        configORGS(org, orgDIR)
        orgs.append(orgDIR)

    return orgs


def generateDeploymentPod(orgs):
    for org in orgs:

        if org.find("peer") != -1:  # whether it create orderer pod or peer pod
            suffix = "/peers"
        else:
            suffix = "/orderers"

        members = os.listdir(org + suffix)
        for member in members:
            memberDIR = os.path.join(org + suffix, member)
            generateYaml(member, memberDIR, suffix)


# TODO kafa nodes and zookeeper nodes don't have dir to store their certificate, must use anotherway to create pod yaml.

def allInOne():
    peerOrgs = generateNamespacePod(PEER)
    generateDeploymentPod(peerOrgs)

    ordererOrgs = generateNamespacePod(ORDERER)
    generateDeploymentPod(ordererOrgs)


if __name__ == "__main__":
    kwargs_obj = parse_cmd_line_args()

    set_global_vars(kwargs_obj.crypto_config_dir[0], kwargs_obj.templates_dir[0])

    allInOne()

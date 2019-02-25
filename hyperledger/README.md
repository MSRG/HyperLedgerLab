Supported Versions:
* Fabric Binaries version: 1.2.1, 1.4.0
* Fabric CA version: 1.2.1, 1.4.0
* Fabric CouchDB: 0.4.12, 0.4.14

To support other binaries versions
1. Add fabric bin binaries in hyperledger/roles/network_config/files/bin_{version}
2. Change version variables in hyperledger/roles/network_config/defaults/main.yaml

Download binaries:

`curl -sSL http://bit.ly/2ysbOFE | bash -s {Version e.g 1.2.1}`

`rm -rf ./bin; cp -r fabric-samples/bin ./bin; rm -rf fabric-samples`
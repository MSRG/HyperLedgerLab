#!/usr/bin/env bash

sh ../scripts/fabric_delete.sh
sh ../scripts/fabric_setup.sh -e fabric_version=2.2.1 -e fabric_create_cli=true -e fabric_orderer_type=etcdraft
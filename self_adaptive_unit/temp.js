const fs = require('fs');
const yaml = require('js-yaml');

const doc = yaml.load(fs.readFileSync('inventory/blockchain/group_vars/blockchain-setup.yaml', 'utf8'));
console.log(doc.fabric_batchsize[0]);

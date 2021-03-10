'use strict';

const rand = require('./random');
const seeds = require('./seeds.json');
const getParameters = require('./getParameters');

class queryStock {

    static get() {

    let args;
    let standardDerivation = getParameters.keyPickerType();

    let randomAccessKey = rand.randomIndex(seeds.allLsp.length, standardDerivation);
    let lsp = seeds.allLsp[randomAccessKey];
    let lspName = lsp !== undefined ? lsp.name : 'LSPA';

            args = {
                contractId: 'supplychain',
                contractVersion: 'v1',
                contractFunction: 'queryStock',
                contractArguments: [lspName],
                timeout: 30
            };


            return args;

        }
}

module.exports = queryStock;


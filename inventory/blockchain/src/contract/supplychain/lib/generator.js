'use strict';

const fs = require('fs');

const LSP = require('./logistics/lsp.js');
const TradeItem  = require('./logistics/tradeItem.js');
const GTIN = require('./gs1/gtin.js');
const Pallet  = require('./logistics/pallet.js');
const PalletGroup  = require('./logistics/palletGroup.js');
const InitialConfiguration = require('./lspInitialConfiguration.json');

// this two arrays contains all the LSPs and SSCC for access
// in the init routine and other test cases.
let allLSP = [];
let allSSCC = [];
let allLogisticUnit = [];

for (const lspName in InitialConfiguration.mapping) {
    // create a new lsp
    const lsp = new LSP('LSP' + lspName);

    // create a product GTIN at lsp
    const gtin = new GTIN(lsp.gln.gs1CompanyPrefix);
    const tradeItem = new TradeItem(gtin);

    // store the lsp in an array for access
    allLSP.push(lsp);

    // get share of total palletGroups for lsp
    const palletGroupNumber = InitialConfiguration.mapping[lspName];

    for (let i = 0; i < palletGroupNumber; i++) {
        // create new palletGroup and add it's identifier
        let palletGroup = new PalletGroup(lsp, true);
        allSSCC.push(palletGroup.sscc.toString());

        // add four pallets SSCCs per palletGroup
        let allPalletSSCCForGroup = [];
        for (let j = 0; j < 4; j++) {
            let contains = [];
            for (let i = 0; i < 100; i++) {
                contains[i] = tradeItem;
            }
            // New pallets are initialized at the current lsp, not ready to ship (=false),
            // the third parameter sscc is set to undefined to generate a fresh one and
            // with the just created tradeItem.
            let pallet = new Pallet(lsp, false, undefined, contains);

            allPalletSSCCForGroup.push(pallet.sscc.toString());
            allSSCC.push(pallet.sscc.toString());
            allLogisticUnit.push(pallet);
        }
        palletGroup.contains = allPalletSSCCForGroup;
        allLogisticUnit.push(palletGroup);
    }
}

const json = JSON.stringify({
    allLogisticUnit: allLogisticUnit,
    allLsp: allLSP,
    allSSCC: allSSCC,
}, null, 4);

fs.writeFile('seeds.json', json, function(err) {
    if (err) {
        console.log(err);
    }
});

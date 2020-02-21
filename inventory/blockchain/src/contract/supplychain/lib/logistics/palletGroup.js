'use strict';

const LogisticUnit = require('./logisticUnit.js');
// const Pallet = require('./pallet');
const SSCC = require('../gs1/sscc');
const LSP = require('./lsp');

class PalletGroup extends LogisticUnit {

    /**
     * Represents a PalletGroup.
     * @constructor
     * @param {GLN} lsp - The lsp controlling the Pallet Group
     * @param {SSCC} sscc - The SSCC for the Pallet Group
     * @param {Pallet[]} allPallet - The contained pallets
     * @param {Boolean} ready - Specifies wether the item is ready to ship
     */
    constructor(lsp, ready, sscc, allPallet) {
        super(lsp, ready, sscc);
        if (allPallet !== undefined) {
            this.allPallet = allPallet;
        }
        this.docType = 'palletGroup';
    }

    static fromJSON(object) {
        if (object.docType !== undefined) {
            if (object.docType === 'palletGroup') {
                if (object.lsp !== undefined &&
                    object.allPallet !== undefined &&
                    object.sscc !== undefined &&
                    object.ready !== undefined) {

                    let allPallet = object.allPallet;
                    let sscc = SSCC.fromJSON(object.sscc);

                    let lsp = LSP.fromJSON(
                        object.lsp.name,
                        object.lsp.gln.gs1CompanyPrefix,
                        object.lsp.gln.locationReference,
                        object.lsp.gln.checkDigit);

                    const palletGroup = new PalletGroup(
                        lsp,
                        object.ready,
                        sscc,
                        allPallet);
                    // the palletGroup calls overrides the location setter, so we use it here
                    palletGroup.location = lsp;
                    return palletGroup;
                }
            } else {
                throw new Error(`${object} is not a palletGroup`);
            }
        } else {
            throw new Error(`${object} is not a palletGroup`);
        }
    }

    /** Set the pallet group location and recursively set contained trade items
     *
     * @param {LSP} lsp - pallet group location
     */
    set location(lsp) {
        super.location = lsp;
    }

    get location() {
        return super.location;
    }

    /**
     * @param {Pallet[]} allPallet - All contained pallets
     */
    set contains(allPallet) {
        this.allPallet = allPallet;
    }
}

module.exports = PalletGroup;
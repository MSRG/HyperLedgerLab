'use strict';

const LogisticUnit = require('./logisticUnit.js');
const TradeItem = require('./tradeItem');
const SSCC = require('../gs1/sscc');
const LSP = require('./lsp');

class Pallet extends LogisticUnit {

    /**
     * Represents a Pallet.
     * @constructor
     * @param {LSP} lsp - The LSP controlling the Pallet
     * @param {SSCC} sscc - The SSCC for the Pallet
     * @param {TradeItem[]} allTradeItem - The contained trade items
     * @param {Boolean} ready - Specifies wether the item is ready to ship
     */
    constructor(lsp, ready, sscc, allTradeItem) {
        super(lsp, ready, sscc);
        if (allTradeItem !== undefined) {
            this.allTradeItem = allTradeItem;
        }
        this.docType = 'pallet';
    }

    static fromJSON(object) {
        if (object.docType !== undefined) {
            if (object.docType === 'pallet') {
                if (object.lsp !== undefined &&
                    object.allTradeItem !== undefined &&
                    object.sscc !== undefined) {

                    let allTradeItem = object.allTradeItem.map(tradeItem => {
                        return new TradeItem(tradeItem.gtin);
                    });
                    let sscc = SSCC.fromJSON(object.sscc);
                    let lsp = LSP.fromJSON(
                        object.lsp.name,
                        object.lsp.gln.gs1CompanyPrefix,
                        object.lsp.gln.locationReference,
                        object.lsp.gln.checkDigit);
                    return new Pallet(lsp, object.ready, sscc, allTradeItem);
                }
            } else {
                throw new Error(`${object} is not a Pallet`);
            }
        } else {
            throw new Error(`${object} is not a Pallet`);
        }
    }

    /**
     * @param {TradeItem[]} allTradeItem - The contained trade items
     */
    set contains(allTradeItem) {
        this.allTradeItem = allTradeItem;
        if (allTradeItem.length > 0 ) {
            this.content = allTradeItem[0] === undefined ? '' : allTradeItem[0].gtin;
        }
    }
}

module.exports = Pallet;

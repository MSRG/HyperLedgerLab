'use strict';

const Utils = require('../utils.js');

// uses GTIN-13
// https://www.gs1.org/docs/barcodes/GS1_General_Specifications.pdf, p. 140
class GTIN {
    constructor(gs1CompanyPrefix, itemReference, checkDigit) {
        this.gs1ApplicationIdentifier = '01';
        this.prefixValue = '0';
        if (itemReference !== undefined) {
            this.itemReference = itemReference;
        } else {
            this.itemReference = '';
            for (let i = 0; i < 5; i++) {
                this.itemReference += Utils.getRandomInt();
            }
        }
        this.gs1CompanyPrefix = gs1CompanyPrefix;
        if (checkDigit !== undefined) {
            this.checkDigit = checkDigit;
        } else {
            this.checkDigit = String(Utils.calculateCheckDigit(
                this.gs1ApplicationIdentifier +
                this.prefixValue +
                this.gs1CompanyPrefix +
                this.itemReference
            ));
        }
    }

    toString() {
        return this.gs1ApplicationIdentifier +
            this.prefixValue +
            this.gs1CompanyPrefix +
            this.itemReference +
            this.checkDigit;
    }

    static fromJSON(gs1CompanyPrefix, itemReference, checkDigit) {
        if (gs1CompanyPrefix !== undefined && itemReference !== undefined && checkDigit !== undefined) {
            return new GTIN(gs1CompanyPrefix, itemReference, checkDigit);
        }
    }
}

module.exports = GTIN;

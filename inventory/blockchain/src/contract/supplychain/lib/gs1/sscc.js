'use strict';

const Utils = require('../utils.js');

class SSCC {

    /**
     * Represents a SSCC, it contains:
     * - applicationIdentifier 2 digits
     * - extensionDigit 1 digit
     * - gs1CompanyPrefix 7 digits
     * - serialReference 7 digits
     * - checkDigit 1 digits
     * @constructor
     * @param {string} gs1CompanyPrefix - The gs1CompanyPrefix for the SSCC
     */
    constructor(gs1CompanyPrefix, extensionDigit, serialReference, checkDigit) {
        this.applicationIdentifier = '00';
        this.extensionDigit = (extensionDigit === undefined) ? String(Utils.getRandomInt()) : extensionDigit;
        this.gs1CompanyPrefix = gs1CompanyPrefix;
        // create 7 digit serial reference
        if (serialReference === undefined ) {
            this.serialReference = '';
            for (let i = 0; i < 7; i++) {
                this.serialReference += Utils.getRandomInt();
            }
        } else {
            this.serialReference = serialReference;
        }
        if (checkDigit === undefined) {
            this.checkDigit = String(Utils.calculateCheckDigit(
                this.applicationIdentifier +
                this.extensionDigit +
                this.gs1CompanyPrefix +
                this.serialReference
            ));
        } else {
            this.checkDigit = checkDigit;
        }
    }

    static fromJSON(object) {
        if (object.gs1CompanyPrefix !== undefined &&
            object.extensionDigit !== undefined &&
            object.serialReference !== undefined &&
            object.checkDigit !== undefined) {
            return new SSCC(
                object.gs1CompanyPrefix,
                object.extensionDigit,
                object.serialReference,
                object.checkDigit);
        } else {
            throw new Error(`${object} is not a SSCC`);
        }
    }

    toString() {
        return this.applicationIdentifier +
            this.extensionDigit +
            this.gs1CompanyPrefix +
            this.serialReference +
            this.checkDigit;
    }

    /**
     * Parse a SSCC from its string representation
     * @param {string} ssccString
     */
    static fromString(ssccString) {
        const applicationIdentifier = ssccString.substring(0, 2);
        if (applicationIdentifier !== '00') {
            throw new Error(`${ssccString} not a valid SSCC`);
        }
        const extensionDigit = ssccString.substring(2, 3);
        const gs1CompanyPrefix = ssccString.substring(3, 10);
        const serialReference = ssccString.substring(10, 17);
        const checkDigit = ssccString.substring(17, 18);
        return new SSCC(extensionDigit, gs1CompanyPrefix, serialReference, checkDigit);
    }
}

module.exports = SSCC;

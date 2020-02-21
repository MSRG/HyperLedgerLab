
'use strict';

const Utils = require('../utils.js');

/**
 * Global Location Number
 */
// uses GLN-13
class GLN {
    constructor(gs1CompanyPrefix, locationReference, checkDigit) {
        // 7 digits
        if (gs1CompanyPrefix === undefined) {
            this.gs1CompanyPrefix = '';
            for (let i = 0; i < 7; i++) {
                this.gs1CompanyPrefix += Utils.getRandomInt();
            }
        } else {
            this.gs1CompanyPrefix = gs1CompanyPrefix;
        }
        // create 5 digits locationReference
        if (locationReference === undefined) {
            this.locationReference = '';
            for (let i = 0; i < 5; i++) {
                this.locationReference += Utils.getRandomInt();
            }
        } else {
            this.locationReference = locationReference;
        }
        // 1 digit 2008613 50152 3
        if (checkDigit === undefined) {
            this.checkDigit = String(Utils.calculateCheckDigit(
                this.gs1CompanyPrefix +
                this.locationReference
            ));
        } else {
            this.checkDigit = checkDigit;
        }
    }

    toString() {
        return this.gs1CompanyPrefix +
            this.locationReference +
            this.checkDigit;
    }

    static fromString(glnString) {
        const gs1CompanyPrefix = glnString.substring(0, 7);
        const locationReference = glnString.substring(7, 12);
        const checkDigit = glnString.substring(12, 13);
        return new GLN(gs1CompanyPrefix, locationReference, checkDigit);
    }
}

module.exports = GLN;

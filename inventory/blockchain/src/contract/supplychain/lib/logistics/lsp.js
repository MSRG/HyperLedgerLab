'use strict';

const GLN = require('../gs1/gln.js');

/**
     * Represent a Logistic Service Provider (LSP)
     * identified by its name and a unique GLN.
     */
class LSP {
    constructor(name, gs1CompanyPrefix, locationReference, checkDigit) {
        this.name = name;
        this.gln = new GLN(gs1CompanyPrefix, locationReference, checkDigit);
    }

    toString() {
        return this.name + this.gln.toString();
    }

    static fromJSON(name, gs1CompanyPrefix, locationReference, checkDigit) {
        if (name !== undefined) {
            // for the other parameters we leverage the undefined checks of the GLN object.
            return new LSP(name, gs1CompanyPrefix, locationReference, checkDigit);
        }
    }
}
module.exports = LSP;

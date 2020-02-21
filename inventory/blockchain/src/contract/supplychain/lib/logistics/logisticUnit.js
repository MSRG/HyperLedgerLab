'use strict';

const SSCC = require('../gs1/sscc.js');

class LogisticUnit {
    /**
     * Represents a LogisticUnit - the shippable units in the system
     * when creating one a new SSCC is automatically generated.
     * @constructor
     * @param {LSP} lsp - The lsp controlling the Logistic Unit
     */
    constructor(lsp, ready, sscc) {
        this.lsp = lsp;
        this.ready = ready === undefined ? false : ready;
        this.sscc = (sscc === undefined) ? new SSCC(lsp.gln.gs1CompanyPrefix) : sscc;
    }

    get location() {
        return this.lsp;
    }


    set location(lsp) {
        this.lsp = lsp;
    }
}

module.exports = LogisticUnit;

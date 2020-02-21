'use strict';

class Unit {
    /**
     * Represents a Unit - it represents the general purpose datatype in the system
     * @constructor
     * @param {LSP} lsp - The LSP which currently controls the unit
     */
    constructor(lsp, ready) {
        this.lsp = lsp;
        this.ready = ready === undefined ? false : ready;
    }
}

module.exports = Unit;

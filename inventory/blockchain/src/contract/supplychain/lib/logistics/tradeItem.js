'use strict';

class TradeItem {
    /*
     * Represents a TradeItem, identified by a GTIN and representing the
     * smallest unit in the system.
     * @constructor
     * @param {GTIN} gtin - Global Trade Item Number
     */
    constructor(gtin) {
        this.gtin = gtin;
    }
}

module.exports = TradeItem;

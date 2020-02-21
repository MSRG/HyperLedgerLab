'use strict';

const Utils = require('./utils');

/**
 * This class models an eleven digit CISAC
 * Interested Party Information (IpiName) Name Number
 */

class IpiName {
    constructor(IpiName) {
        this.IpiName = IpiName === undefined ? Utils.generateRandomNumberString(11) : IpiName;
    }

    static fromJSON(obj) {
        if (obj.IpiName !== undefined) {
            return new IpiName(obj.IpiName);
        }
    }
}

module.exports = IpiName;
'use strict';

/**
 * This class contains information about the right holders of
 * an art work and the fees collected for each consumption.
 * Right holder identifiers are stored as dedicated `IPI` numbers and
 * map to a rational number from (0,1] specifying a right holders share.
 * Furthermore the number of total plays is recorded via the `playCount`.
 */

class  RoyaltyManagement {
    constructor(perPlayRoyalty, allRightHolder, playCount) {
        this.docType = 'royaltyManagement';
        this.perPlayRoyalty = perPlayRoyalty;
        this.allRightHolder = allRightHolder === undefined ? {} : allRightHolder;
        this.playCount = playCount === undefined ? 0 : playCount;
    }

    static fromJSON(obj) {
        if (obj.perPlayRoyalty !== undefined) {
            return new RoyaltyManagement(obj.perPlayRoyalty, obj.allRightHolder, obj.playCount);
        }
    }

    incrementPlayCount() {
        this.playCount++;
    }
}

module.exports = RoyaltyManagement;
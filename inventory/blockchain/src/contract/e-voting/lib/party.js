'use strict';

/**
 * Class used for persisting a partys vote count on the world-state
 */
class Party {
    constructor(name, voteCount) {
        this.docType = 'party';
        this.name = name;
        this.voteCount = (voteCount === undefined) ? 0 : voteCount;
    }

    static fromJSON(obj) {
        if (obj.name !== undefined) {
            return new Party(obj.name, obj.voteCount);
        }
    }

    addVote() {
        this.voteCount++;
    }
}

module.exports = Party;
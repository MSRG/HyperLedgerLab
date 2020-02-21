'use strict';

class Ballot {
    constructor(voterId, electionId, hasVoted) {
        this.docType = 'ballot';
        this.voterId = voterId;
        this.electionId = electionId;
        this.hasVoted = ( hasVoted === undefined ) ? false : hasVoted;
    }

    static fromJSON(obj) {
        if (obj.voterId !== undefined && obj.electionId !== undefined) {
            return new Ballot(obj.voterId, obj.electionId, obj.hasVoted);
        }
    }

    vote(electionId) {
        if (electionId !== this.electionId) {
            throw new Error(`${electionId} is invalid`);
        }
        if (this.hasVoted) {
            throw new Error(`${this.voterId} already voted`);
        }
        this.hasVoted = true;
    }
}

module.exports = Ballot;
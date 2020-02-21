'use strict';

class Election {
    constructor(allParty, electionClosed) {
        this.docType = 'election';
        this.allParty = (allParty === undefined) ? {} : allParty;
        this.electionClosed = (electionClosed === undefined) ? false : electionClosed;
    }

    static fromJSON(obj) {
        if (obj.allParty !== undefined) {
            return new Election(obj.allParty, obj.electionClosed);
        }
    }

    /**
     * Return a world-state ids for the parties taking part of the election.
     */
    get allPartyId() {
        return (this.allParty === undefined) ? [] :  Object.keys(this.allParty);
    }

    /**
     * Sets a supplied count to a partys result if the party was part of the election.
     * @param {String} partyId
     * @param {Number} count
     */
    addCountToParty(partyId, count) {
        if (this.allParty !== undefined) {
            if (this.allParty.hasOwnProperty(partyId)) {
                this.allParty[partyId] = count;
            }
        }
    }

    /**
     * Returns the results of the election with the winning party leading the list.
     * @param {Object{String,Number}} allPartyResult
     */
    static electionResultsDescending(allPartyResult) {
        let electionResults = [];
        for (const party in allPartyResult) {
            electionResults.push([party, allPartyResult[party]]);
        }
        electionResults.sort(function(a, b) {
            return b[1] - a[1];
        });
        return electionResults;
    }
}

module.exports = Election;
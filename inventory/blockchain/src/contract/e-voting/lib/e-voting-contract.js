/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const Utils = require('./utils');
const Ballot = require('./ballot');
const Party = require('./party');
const Election = require('./election');
const seeds = require('./seeds.json');

class EVotingContract extends Contract {

    async init(ctx) {
        console.info('================ EVotingContract initialized ================');
    }
    async doNothing(ctx) {
        console.info('============= DoNothing Function ===========');
    }



    //////////////////////////////////////////
    // Election Committee functions

    async createElection(ctx) {
        const electionId = seeds.electionId;
        const election = Election.fromJSON({
            allParty: seeds.allParty
        });
        console.info(election);
        const buffer = Buffer.from(JSON.stringify(election));
        await ctx.stub.putState(electionId, buffer);

        for (let [partyId, partyName] of Object.entries(seeds.allParty)) {
            const party = Party.fromJSON({
                name: partyName
            });
            let partyKey = ctx.stub.createCompositeKey(electionId, [partyId]);
            const partyBuffer = Buffer.from(JSON.stringify(party));
            await ctx.stub.putState(partyKey, partyBuffer);
        }

        for (const ballotId of Object.values(seeds.allVoterId)) {
            await this.giveRightToVote(ctx, ballotId, electionId);
        }
    }

    /**
     * Creates an election ballot for an eligible voter
     * @param {Contxt} ctx
     * @param {*} ballotId
     * @param {*} electionId
     */
    async giveRightToVote(ctx, ballotId, electionId) {
        let ballotBuffer = await ctx.stub.getStateByPartialCompositeKey(electionId, [ballotId]);
        if (!(!!ballotBuffer && ballotBuffer.length > 0)) {
            const ballot = new Ballot(ballotId, electionId);
            let ballotKey = ctx.stub.createCompositeKey(electionId, [ballotId]);
            ballotBuffer = Buffer.from(JSON.stringify(ballot));
            await ctx.stub.putState(ballotKey, ballotBuffer);
        }
    }

    /**
     * Set the election entry to closed, preventing any subsequent voting attempts
     * @param {Context} ctx
     * @param {String} electionId
     */
    async closeElection(ctx, electionId) {
        let electionBuffer = await ctx.stub.getState(electionId);
        const election = Utils.handleStateQueryResult(electionBuffer);
        election.electionClosed = true;
        electionBuffer = Buffer.from(JSON.stringify(election));
        await ctx.stub.putState(electionId, electionBuffer);
    }

    //////////////////////////////////////////
    // voter functions

    /**
     * Returns all parties listed for the given election
     * @param {Context} ctx
     * @param {String} electionId
     */
    async queryParties(ctx, electionId) {
        const electionBuffer = await ctx.stub.getState(electionId);
        const election = Utils.handleStateQueryResult(electionBuffer);
        let allParty = {};
        for (let i = 0; i < election.allPartyId.length; i++) {
            const partyBuffer = await ctx.stub.getStateByPartialCompositeKey(electionId, [election.allPartyId[i]]);
            const partyArray = await Utils.handleStateQueryIterator(partyBuffer);
            const party = partyArray[0];
            allParty[election.allPartyId[i]] = party.name;
        }
        return allParty;
    }

    /**
     * Collect voteCounts from the listed parties and provide unified result
     * @param {Context} ctx
     * @param {String} electionId
     */
    async seeResults(ctx, electionId) {
        const electionBuffer = await ctx.stub.getState(electionId);
        const election = Utils.handleStateQueryResult(electionBuffer);
        let allPartyResult = {};

        // get all party voteCounts
        for (let i = 0; i < election.allPartyId.length; i++) {
            const partyBuffer = await ctx.stub.getStateByPartialCompositeKey(electionId, [election.allPartyId[i]]);
            const partyArray = await Utils.handleStateQueryIterator(partyBuffer);
            const party = partyArray[0];
            allPartyResult[party.name] = party.voteCount;
        }

        // sort by descending order
        return Election.electionResultsDescending(allPartyResult);
    }

    /**
     * Increment the vote count for the given party and restricts
     * the voter from casting a vote again.
     * @param {Context} ctx
     * @param {String} ballotId
     * @param {String} electionId
     * @param {String} partyId
     */
    async vote(ctx, ballotId, electionId, partyId) {
        const electionBuffer = await ctx.stub.getState(electionId);
        const election = Utils.handleStateQueryResult(electionBuffer);
        if (election.electionClosed) {
            throw new Error(`Election ${electionId} has already closed`);
        }

        let ballotBuffer = await ctx.stub.getStateByPartialCompositeKey(electionId, [ballotId]);
        const ballotArray = await Utils.handleStateQueryIterator(ballotBuffer);
        const ballot = ballotArray[0];
        // checks if voter has already casted the vote
        // and if the electionId matches
        ballot.vote(electionId);

        let partyBuffer = await ctx.stub.getStateByPartialCompositeKey(electionId, [partyId]);
        const partyArray = await Utils.handleStateQueryIterator(partyBuffer);
        const party = partyArray[0];
        party.addVote();

        // persist
        let ballotKey = ctx.stub.createCompositeKey(electionId, [ballotId]);
        ballotBuffer = Buffer.from(JSON.stringify(ballot));
        await ctx.stub.putState(ballotKey, ballotBuffer);
        let partyKey = ctx.stub.createCompositeKey(electionId, [partyId]);
        partyBuffer = Buffer.from(JSON.stringify(party));
        await ctx.stub.putState(partyKey, partyBuffer);
    }
}

module.exports = EVotingContract;

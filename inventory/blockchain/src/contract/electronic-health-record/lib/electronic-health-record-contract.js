/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const Utils = require('./utils.js');
const sha512 = require('js-sha512');
const Ehr = require('./ehr.js');
const Profile = require('./profile.js');
const seeds = require('./seeds.json');

/**
 * A Hyperledger Fabric SmartContract implementing a
 * Electronic Health Record (EHR) Managment application. It
 * supports the creation of patient profiles including
 * the access to remote EHR stored at various health care providers.
 * The application features a permission managment for users and allows
 * other actors (Physicians, Researchers) to make use of the data.
 */

class ElectronicHealthRecordContract extends Contract {

    async init(ctx) {
        console.info('============= Init Electronic Health Record Contract===========');
    }

    /**
     * Function being called when test prerequisted can not be satisfied
     * @param {Context} ctx
     */
    async doNothing(ctx) {
        console.info('============= DoNothing Function ===========');
    }

    /**
     * Initializes the worldstate with precomputed sets of profile and EHR entries
     * @param {Context} ctx
     */
    async initLedger(ctx) {
        for (let [key, value] of Object.entries(seeds.allProfile)) {
            const ssn = key;
            const profile = Profile.fromJSON(value);
            console.info(JSON.stringify(profile));
            const buffer = Buffer.from(JSON.stringify(profile));
            await ctx.stub.putState(ssn, buffer);
        }
        for (let [key, value] of Object.entries(seeds.allUsedEhr)) {
            const ehrId = key;
            const ehr = Ehr.fromJSON(JSON.parse(value));
            console.info(ehr);
            const buffer = Buffer.from(JSON.stringify(ehr));
            await ctx.stub.putState(ehrId, buffer);
        }
    }

    /**
     * Query the world state and return the entry
     * if the supplied key matches.
     * @param {Context} ctx
     * @param {String} ssn
     * @param {String} key
     */
    async readProfile(ctx, ssn, key) {
        const buffer = await ctx.stub.getState(ssn);
        const profile = Utils.handleStateQueryResult(buffer);
        const hashedKey = sha512(key);
        if (hashedKey === profile.hashedKey) {
            return profile;
        }
    }

    /**
     * Updates the state world state entry specified by the `ssn` by
     * adding the supplied actorId to the accessList.
     *
     * @param {Context} ctx
     * @param {String} ssn
     * @param {String} key
     * @param {Number} actorId
     */
    async grantProfileAccess(ctx, ssn, key, actorId) {
        const buffer = await ctx.stub.getState(ssn);
        const profile = Utils.handleStateQueryResult(buffer);
        const hashedKey = sha512(key);
        if (hashedKey === profile.hashedKey) {
            profile.grantProfileAccess(hashedKey, actorId);
            const buffer = Buffer.from(JSON.stringify(profile));
            await ctx.stub.putState(ssn, buffer);
            return profile;
        }
    }

    /**
     * Updates the state world state entry specified by the `ssn` by
     * removing the supplied actorId to the accessList.
     *
     * @param {Context} ctx
     * @param {String} ssn
     * @param {String} key
     * @param {Number} actorId
     */
    async revokeProfileAccess(ctx, ssn, key, actorId) {
        const buffer = await ctx.stub.getState(ssn);
        const profile = Utils.handleStateQueryResult(buffer);
        const hashedKey = sha512(key);
        if (hashedKey === profile.hashedKey) {
            profile.revokeProfileAccess(hashedKey, actorId);
            const buffer = Buffer.from(JSON.stringify(profile));
            await ctx.stub.putState(ssn, buffer);
            return profile;
        }
    }

    /**
     * Updates the both state world state entry specified by the `ssn`
     * and the one specified by the `ehrId` by adding the supplied
     * actorId to the accessList of both entries.
     *
     * @param {Context} ctx
     * @param {String} ssn
     * @param {String} ehrId
     * @param {String} key
     * @param {Number} actorId
     */
    async grantEHRAccess(ctx, ssn, ehrId, key, actorId) {
        const buffer = await ctx.stub.getState(ssn);
        const profile = Utils.handleStateQueryResult(buffer);
        const hashedKey = sha512(key);
        if (hashedKey === profile.hashedKey) {
            profile.grantEHRAccess(hashedKey, actorId, ehrId);
            const buffer = Buffer.from(JSON.stringify(profile));
            await ctx.stub.putState(ssn, buffer);

            let ehrBuffer = await ctx.stub.getState(ehrId);
            const ehr = Utils.handleStateQueryResult(ehrBuffer);
            ehr.addToAccessList(actorId);
            ehrBuffer = Buffer.from(JSON.stringify(ehr));
            await ctx.stub.putState(ehrId, ehrBuffer);
        }
    }

    /**
     * Updates the both state world state entry specified by the `ssn`
     * and the one specified by the `ehrId` by removing
     * the supplied actorId to the accessList of both entries.
     *
     * @param {Context} ctx
     * @param {String} ssn
     * @param {String} ehrId
     * @param {String} key
     * @param {Number} actorId
     */
    async revokeEHRAccess(ctx, ssn, ehrId, key, actorId) {
        const buffer = await ctx.stub.getState(ssn);
        const profile = Utils.handleStateQueryResult(buffer);
        const hashedKey = sha512(key);
        if (hashedKey === profile.hashedKey) {
            profile.revokeEHRAccess(hashedKey, actorId, ehrId);
            const buffer = Buffer.from(JSON.stringify(profile));
            await ctx.stub.putState(ssn, buffer);

            let ehrBuffer = await ctx.stub.getState(ehrId);
            const ehr = Utils.handleStateQueryResult(ehrBuffer);
            ehr.removeFromAccessList(actorId);
            ehrBuffer = Buffer.from(JSON.stringify(ehr));
            await ctx.stub.putState(ehrId, ehrBuffer);
        }
    }

    /**
     * Returns a reduced patient profile specified by a `ssn`,
     * including the all ehr accessible by the requesting actor.
     * @param {Context} ctx
     * @param {String} ssn
     * @param {Number} actorId
     */
    async viewPartialProfile(ctx, ssn, actorId) {
        const buffer = await ctx.stub.getState(ssn);
        const profile = Utils.handleStateQueryResult(buffer);
        return profile.viewPartialProfile(actorId);
    }

    /**
     * Adds an ehr entry to a patients profile and the
     * corresponding ehr to the worldstate. Prior to
     * updating the profile the access rights are checked
     * and the operation is aborted if the actor is unauthorized.
     *
     * @param {Context} ctx
     * @param {String} ssn
     * @param {String} actorId
     * @param {String} ehr
     */
    async addEHR(ctx, ssn, actorId, ehr, ehrId) {
        // check if ehrId does not exist in world-state
        const ehrCheck = await ctx.stub.getState(ehrId);
        if (!!ehrCheck && ehrCheck.length > 0) {
            console.info(`EHR with id ${ehrId} already exists`);
            // throw new Error(`EHR with id ${ehrId} already exists`);
        }
        // add the actor supplying the ehr to the access list
        const ehrObj = Ehr.fromJSON(JSON.parse(ehr));
        ehrObj.addToAccessList(actorId);
        const ehrBuffer = Buffer.from(JSON.stringify(ehrObj));
        await ctx.stub.putState(ehrId, ehrBuffer);

        let buffer = await ctx.stub.getState(ssn);
        const profile = Utils.handleStateQueryResult(buffer);
        // Will throw error if the actor has no access rights
        profile.addEHR(actorId, Number.parseInt(ehrId));
        buffer = Buffer.from(JSON.stringify(profile));
        await ctx.stub.putState(ssn, buffer);
    }

    /**
     * Returns an ehr entry for an authorized actor
     *
     * @param {Context} ctx
     * @param {String} ehrId
     * @param {Number} actorId
     */
    async viewEHR(ctx, ehrId, actorId) {
        console.info('============= START : viewEHR ===========');
        const buffer = await ctx.stub.getState(ehrId);
        const ehr = Utils.handleStateQueryResult(buffer);
        console.info('============= END : viewEHR ===========');
        if (ehr.hasAccess(actorId)) {
            return ehr;
        } else {
            return {};
        }
    }

    /**
     * Returns all EHR entries for which the supplied actorId is included
     * in the access list.
     * @param {Context} ctx
     * @param {String} actorId
     */
    async getAllEHRforActor(ctx, actorId) {
        console.info('============= START : getAllEHRforActor ===========');
        console.info(actorId);
        let queryString = {};
        queryString.selector = {
            docType: 'ehr',
            accessList: {
                $elemMatch: {
                    $eq: Number.parseInt(actorId)
                }
            }
        };

        let resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));

        if (!resultsIterator) {
            console.log(`${actorId} does not exist`);
            // throw new Error(`${actorId} does not exist`);
        }
        const allResult = await Utils.handleStateQueryIterator(resultsIterator);
        console.info('============= END : getAllEHRforActor ===========');
        return allResult;
    }
}

module.exports = ElectronicHealthRecordContract;

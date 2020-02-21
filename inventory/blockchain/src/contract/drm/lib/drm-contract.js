/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

const seeds = require('./seeds.json');

const Utils = require('./utils');
const RoyaltyManagement = require('./royaltyManagement');
const Metadata = require('./metadata');

class DrmContract extends Contract {

    async init(ctx) {
        console.info('DRM Contract initialized');
    }

    async doNothing(ctx) {
        console.info('============= DoNothing Function ===========');
    }

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        for (let [key, value] of Object.entries(seeds.allUploadedArtwork)) {
            const val = JSON.parse(value);
            const asset = Metadata.fromJSON(val);
            console.info(`${asset}`);
            const buffer = Buffer.from(JSON.stringify(asset));
            await ctx.stub.putState(key, buffer);
        }

        for (let [key, value] of Object.entries(seeds.allUploadedRoyaltyManagement)) {
            const val = JSON.parse(value);
            const asset = RoyaltyManagement.fromJSON(val);
            console.info(`${asset}`);
            const buffer = Buffer.from(JSON.stringify(asset));
            await ctx.stub.putState(key, buffer);
        }
        console.info('============= START : Initialize Ledger ===========');
    }

    async create(ctx, metadataId, metadata, royaltyManagementId, royaltyManagement) {
        let buffer = await ctx.stub.getState(metadataId);
        if (!(!!buffer && buffer.length > 0)) {

            const metadataAsset = Metadata.fromJSON(JSON.parse(metadata));
            console.info(JSON.stringify(metadataAsset));
            const metadataBuffer = Buffer.from(JSON.stringify(metadataAsset));
            await ctx.stub.putState(metadataId, metadataBuffer);

            const royaltyManagementAsset = RoyaltyManagement.fromJSON(JSON.parse(royaltyManagement));
            console.info(JSON.stringify(royaltyManagementAsset));
            const royaltyManagementBuffer = Buffer.from(JSON.stringify(royaltyManagementAsset));
            await ctx.stub.putState(royaltyManagementId, royaltyManagementBuffer);
        }
    }

    async play(ctx, artWorkId) {
        const metadataBuffer = await ctx.stub.getState(artWorkId);
        const metadata = Utils.handleStateQueryResult(metadataBuffer);

        console.info(metadata);

        let royaltyManagementBuffer = await ctx.stub.getState(metadata.royaltyManagementId);
        let royaltyManagementAsset = Utils.handleStateQueryResult(royaltyManagementBuffer);

        royaltyManagementAsset.incrementPlayCount();

        royaltyManagementBuffer = Buffer.from(JSON.stringify(royaltyManagementAsset));
        await ctx.stub.putState(metadata.royaltyManagementId, royaltyManagementBuffer);
    }

    async queryRightHolders(ctx, artWorkId) {
        const metadataBuffer = await ctx.stub.getState(artWorkId);
        const metadata = Utils.handleStateQueryResult(metadataBuffer);

        let result = {};

        if (metadata !== undefined) {
            let royaltyManagementBuffer = await ctx.stub.getState(metadata.royaltyManagementId);
            let royaltyManagementAsset = Utils.handleStateQueryResult(royaltyManagementBuffer);

            result = royaltyManagementAsset.allRightHolder;
        }

        return result;
    }

    async viewMetaData(ctx, artWorkId) {
        const metadataBuffer = await ctx.stub.getState(artWorkId);
        const metadata = Utils.handleStateQueryResult(metadataBuffer);
        return metadata;
    }

    async calcRevenue(ctx, ipiName) {

        let allRoyaltyFee = 0;

        let queryString = {};

        queryString.selector = {
            docType: 'royaltyManagement',
            allRightHolder: {
                $elemMatch: { ipiName: ipiName }
            }
        };

        let resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));

        const allResult = await Utils.handleStateQueryIterator(resultsIterator);

        allResult.forEach(function (royaltyManagementAsset) {
            const share = royaltyManagementAsset.allRightHolder.filter(rightHolder => rightHolder.ipiName === ipiName)[0].share;

            const royaltyFee =
                royaltyManagementAsset.playCount *
                royaltyManagementAsset.perPlayRoyalty *
                share;

            allRoyaltyFee += royaltyFee;
        });

        console.info(`${ipiName} aggregated revenue ${allRoyaltyFee} from ${allResult.length} art works`);

        return { ipiName: allRoyaltyFee };
    }
}

module.exports = DrmContract;

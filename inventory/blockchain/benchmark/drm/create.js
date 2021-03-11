/* eslint-disable no-undef */
'use strict';

const rand = require('./random');
const seeds = require('./seeds.json');
const getParameters = require('./getParameters');

class create {

    static get() {

    let args;
    let standardDerivation = getParameters.keyPickerType();
    let randomAccessKey = rand.randomIndex(seeds.allNewArtworkId.length, standardDerivation);

    // select random artwork
    while (seeds.allNewArtworkId[randomAccessKey] === undefined) {
        randomAccessKey = rand.randomIndex(seeds.allNewArtworkId.length, standardDerivation);
    }

    const artworkId = seeds.allNewArtworkId[randomAccessKey];
    const artwork = seeds.allNewArtwork[artworkId];
    const artjson = JSON.parse(artwork);
    const royaltyManagementId = artjson.royaltyManagementId;

    const royaltyManagement = seeds.allNewRoyaltyManagement[royaltyManagementId];

    //console.info(`${artwork} with royaltyManagementId: ${royaltyManagementId} and royaltyManagement: ${royaltyManagement} is created`);
    //const extraroyaltyManagementId1 = artwork[metadata];
    //const extraroyaltyManagementId = extraroyaltyManagementId1[royaltyManagementId];
    //console.info(`extraroyaltyManagementId: ${extraroyaltyManagementId}`);

	    args = {
                contractId: 'drm',
                contractVersion: 'v1',
                contractFunction: 'create',
                contractArguments: [artworkId, artwork, royaltyManagementId, royaltyManagement],
                timeout: 30
            };


            return args;

        }
}

module.exports = create;



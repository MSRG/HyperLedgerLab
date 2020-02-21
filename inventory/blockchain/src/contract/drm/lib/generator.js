'use strict';

const fs = require('fs');
const read = require('read-yaml');
const RandExp = require('randexp');

const IpiName = require('./ipi');

const Utils = require('./utils');

const parameters = read.sync('seedParameters.yaml');

let allIpiName = [];
let allUploadedArtwork = {};
let allUploadedArtworkId = [];
let allNewArtwork = {};
let allNewArtworkId = [];
let allUploadedRoyaltyManagement = {};
let allNewRoyaltyManagement = {};

function generateArtwork() {
    let metadata = {};
    // eslint-disable-next-line no-trailing-spaces
    // we use dotbc `Track Information` 
    // and `Commercial Information` standard
    let artist = new IpiName();
    metadata.CompositionTitle = Utils.generateRandomNumberString(10);
    metadata.MasterRecordingTitle = Utils.generateRandomNumberString(10);
    metadata.ArtistName = artist;
    metadata.Distributor = Utils.randomChoiceFromArray(allIpiName);
    metadata.Publisher = Utils.randomChoiceFromArray(allIpiName);
    metadata.AllWriter = Utils.randomChoiceFromArray(allIpiName);
    metadata.IPINames = artist;
    metadata.AffiliatedPRO = Utils.randomChoiceFromArray(allIpiName);
    metadata.NumberofSongs = Utils.generateRandomNumberString(1);
    metadata.ReleaseDate = new Date(2019, Utils.generateRandomNumberString(1), Utils.generateRandomNumberString(1));
    metadata.RecordLabel = Utils.generateRandomNumberString(5);
    metadata.Language = Utils.generateRandomNumberString(3);
    metadata.PrimaryGenre = Utils.generateRandomNumberString(5);
    metadata.SecondaryGenre = Utils.generateRandomNumberString(5);
    const isrc = new RandExp(/['A-Z']{2}['A-Z|0-9']['A-Z|0-9']['A-Z|0-9']['1-9']{2}['0-9']{5}/).gen();
    metadata.ISRC = isrc;
    metadata.UPC = Utils.generateRandomNumberString(13);
    let id = Utils.generateRandomNumberString(9);

    const perPlayRoyalty = Math.random() / 100;
    let allRightHolder = [];

    // guess the artists share
    const share = Math.random();
    allRightHolder.push({ipiName: artist.IpiName, share: share});

    // share remainder
    let remainder = 1 - share;

    let ipShare = Math.random();

    // randomly choose a rightholder
    let newRightHolder = Utils.randomChoiceFromArray(allIpiName);

    while (remainder - ipShare > 0) {

        // shall not already be a rightholder
        while (allRightHolder.some( function(existingRightHolder) {
            return existingRightHolder.ipiName === newRightHolder.ipiName;
        })) {
            newRightHolder = Utils.randomChoiceFromArray(allIpiName);
        }

        allRightHolder.push({ipiName: newRightHolder.IpiName, share: new Number(ipShare)});

        remainder -= new Number(ipShare);

        ipShare = Math.random();
    }

    // attribute the remainder to some randomly selected new right holder
    newRightHolder = Utils.randomChoiceFromArray(allIpiName);
    while (allRightHolder.some( function(existingRightHolder) {
        return existingRightHolder.ipiName === newRightHolder.ipiName;
    })) {
        newRightHolder = Utils.randomChoiceFromArray(allIpiName);
    }

    allRightHolder.push({ipiName: newRightHolder.IpiName, share: new Number(remainder)});

    allIpiName.push(artist);

    const royaltyManagementId = Utils.generateRandomNumberString(8);

    return {
        id: id,
        metadata: metadata,
        royaltyManagement: {
            allRightHolder: allRightHolder,
            perPlayRoyalty: perPlayRoyalty
        },
        royaltyManagementId: royaltyManagementId
    };
}

for (let i = 0; i < parameters.allInterestedParty; i++) {
    let ipiName = new IpiName();
    allIpiName.push(ipiName);
}

for (let j = 0; j < parameters.allUploadedArtwork; j++) {
    const artwork = generateArtwork();
    allUploadedArtwork[artwork.id] = JSON.stringify({
        metadata: artwork.metadata,
        royaltyManagementId: artwork.royaltyManagementId
    });
    allUploadedArtworkId.push(artwork.id);
    allUploadedRoyaltyManagement[artwork.royaltyManagementId] = JSON.stringify(artwork.royaltyManagement);
}

for (let j = 0; j < parameters.allNewArtwork; j++) {
    const artwork = generateArtwork();
    allNewArtwork[artwork.id] = JSON.stringify({
        metadata: artwork.metadata,
        royaltyManagementId: artwork.royaltyManagementId
    });
    allNewArtworkId.push(artwork.id);
    allNewRoyaltyManagement[artwork.royaltyManagementId] = JSON.stringify(artwork.royaltyManagement);
}

const json = JSON.stringify({
    allIpiName: allIpiName,
    allUploadedArtwork: allUploadedArtwork,
    allUploadedArtworkId: allUploadedArtworkId,
    allNewArtwork: allNewArtwork,
    allNewArtworkId: allNewArtworkId,
    allUploadedRoyaltyManagement: allUploadedRoyaltyManagement,
    allNewRoyaltyManagement: allNewRoyaltyManagement,
}, null, 4);

fs.writeFile('seeds.json', json, function(err) {
    if (err) {
        console.log(err);
    }
});
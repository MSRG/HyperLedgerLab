/* eslint-disable no-undef */
'use strict';

const rand = require('./random');
const seeds = require('./seeds.json');
const getParameters = require('./getParameters');

class queryRightHolders {

    static get() {

    let args;
    let standardDerivation = getParameters.keyPickerType();
    let randomAccessKey = rand.randomIndex(seeds.allUploadedArtworkId.length, standardDerivation);

    // select random artwork
    while (seeds.allUploadedArtworkId[randomAccessKey] === undefined) {
        randomAccessKey = rand.randomIndex(seeds.allUploadedArtworkId.length, standardDerivation);
    }

    const artworkId = seeds.allUploadedArtworkId[randomAccessKey];


    console.info(`${artworkId} rightholder get queried`);

        args = {
            chaincodeFunction: 'queryRightHolders',
            chaincodeArguments: [artworkId]
        };

	return args;
        }
}

module.exports = queryRightHolders;


/* eslint-disable no-undef */
'use strict';

const rand = require('./random');
const seeds = require('./seeds.json');
const electionId = seeds.electionId;
const getParameters = require('./getParameters');

class vote {

    static get() {

    let args;
    let standardDerivation = getParameters.keyPickerType();
    let randomAccessKey = rand.randomIndex(seeds.allVoterId.length, standardDerivation);

    // select random actor to give access to
    while (seeds.allVoterId[randomAccessKey] === undefined) {
        randomAccessKey = rand.randomIndex(seeds.allVoterId.length, standardDerivation);
    }

    const ballotId = seeds.allVoterId[randomAccessKey];

    // https://stackoverflow.com/questions/2532218/pick-random-property-from-a-javascript-object
    // chose a random key from the allParty object
    const keys = Object.keys(seeds.allParty);
    const partyId = keys[ keys.length * Math.random() << 0];

    console.info(`${ballotId} voted in ${electionId}`);

        args = {
            chaincodeFunction: 'vote',
            chaincodeArguments: [ballotId, electionId, partyId]
        };
            return args;

        }
}

module.exports = vote;


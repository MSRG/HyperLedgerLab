'use strict';

const fs = require('fs');
const read = require('read-yaml');
const Utils = require('./utils.js');
const boys = require('./boy_names_2016.json');
const girls = require('./girl_names_2016.json');
const sha512 = require('js-sha512');

const parameters = read.sync('seedParameters.yaml');

// https://github.com/aruljohn/popular-baby-names

let allProfile = {};
let allSSN = [];
let allKey = [];
let allUsedEhr = {};
let allEhrFree = {};
let allEhrUsedId = [];
let allEhrFreeId = [];
let allActor = [];

function generateEhr(actorId) {
    let ehrId = Utils.generateRandomNumberString(8);
    while (allEhrUsedId.includes(ehrId) || allEhrFreeId.includes(ehrId)) {
        ehrId = Utils.generateRandomNumberString(8);
    }
    let key = Utils.generateRandomNumberString(10);
    let hashedKey = sha512(key);
    let ressource = 'https://' + Utils.generateRandomNumberString(8) + '?assets?id=' + Utils.generateRandomNumberString(6);
    let ehr = {
        hashedKey: hashedKey,
        ressource: ressource,
        accessList: (actorId !== undefined) ? [actorId] : undefined
    };
    return { ehrId, ehr };
}

for (let k = 0; k < Math.ceil(parameters.allProfileLen / 10); k++) {
    allActor.push(k);
}

for (let i = 0; i < parameters.allProfileLen; i++) {
    let ssn = Utils.generateRandomNumberString(9);
    while (allSSN.includes(ssn)) {
        ssn = Utils.generateRandomNumberString(9);
    }
    let key = Utils.generateRandomNumberString(10);
    let hashedKey = sha512(key);
    let patientName = Utils.oneOrTwo() ? Utils.randomChoiceFromArray(boys.names) : Utils.randomChoiceFromArray(girls.names);
    let age = Math.round(Math.random() * 100);

    let patientAllEhr = undefined;
    let patientAccessList = undefined;

    let actorId = Utils.randomChoiceFromArray(allActor);
    let ehr = generateEhr(actorId);
    patientAccessList = [actorId];
    patientAllEhr = [{
        id: ehr.ehrId,
        accessList: [actorId]
    }];
    allEhrUsedId.push(ehr.ehrId);
    allUsedEhr[ehr.ehrId] = JSON.stringify(ehr.ehr);


    let profile = {
        hashedKey: hashedKey,
        patientName: patientName,
        allEhr: patientAllEhr,
        accessList: patientAccessList,
        age: age
    };
    allProfile[ssn] = profile;

    // the index of the key has to match the index of a ssn linked to a specified profile protected by the key
    allSSN.push(ssn);
    allKey.push(key);
}

for (let j = 0; j < parameters.allEhrLen; j++) {
    let { ehrId, ehr } = generateEhr();
    allEhrFree[ehrId] = JSON.stringify(ehr);
    allEhrFreeId.push(ehrId);
}

const json = JSON.stringify({
    allProfile: allProfile,
    allSSN: allSSN,
    allKey: allKey,
    allUsedEhr: allUsedEhr,
    allEhrFree: allEhrFree,
    allEhrUsedId: allEhrUsedId,
    allEhrFreeId: allEhrFreeId,
    allActor: allActor,
}, null, 4);

fs.writeFile('seeds.json', json, function(err) {
    if (err) {
        console.log(err);
    }
});

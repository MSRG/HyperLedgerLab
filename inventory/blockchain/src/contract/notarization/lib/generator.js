'use strict';

const fs = require('fs');
const read = require('read-yaml');
const RandExp = require('randexp');

const Utils = require('./utils');
const crypto = require('crypto');

const parameters = read.sync('seedParameters.yaml');

let allReader = [];
let allCustodian = [];
let allStudent = [];
let initLedgerDocuments = [];
let benchmarkDocuments = [];

function generateIdKeyPair(id_size, key_size){

    const id = new RandExp('[a-zA-Z]{'+ id_size +'}').gen();
    const key = new RandExp('.{'+ key_size +'}').gen();
    return {
        id: id,
        key: key
    }
}

function generateDocumentHash(){
    let doc = Utils.generateRandomString(parameters.document_length);
    let hash = crypto.createHash('sha256');
    hash.update(doc);
    return hash.digest('hex');
}

function generateDocument(student, custodians, readers){

    let ind_custodian = Utils.getRandomInt(custodians.length);
    let num_readers = Utils.getRandomInt(readers.length + 1);

    let docreaders = [];

    for(let i = 0; i < num_readers; i++){
        let reader = readers[Utils.getRandomInt(readers.length)];

        let index = docreaders.findIndex(x => x === reader);
         if(index === -1){
            docreaders.push(reader);
        } 
    }

    
    let documentHash = generateDocumentHash();

    return {
        documentHash: documentHash,
        student: student,
        custodian: custodians[ind_custodian],
        readers: docreaders
    };
}

//console.log("=============================== Generate seeds.json started");

let i = 0;
while(i < parameters.allReader){
    const reader = new RandExp(/[a-zA-Z ]{10,20}/).gen();
    var index = allReader.findIndex(x => x === reader);
    if(index === -1){
        allReader.push(reader);
        i++;
    } else {
        console.log("Already exists: " + reader);
    }
}

let id_size = parameters.idSize;
let key_size = parameters.keySize;

i = 0;
while(i < parameters.allCustodian){
    let pair = generateIdKeyPair(id_size, key_size);
    var index = allCustodian.findIndex(x => x.id === pair.id);
    if(index === -1){
        allCustodian.push(pair);
        i++;
    } else {
        console.log(`${pair.id} already exists`);
    }
}

i = 0;
while(i < parameters.allStudent){
    let pair = generateIdKeyPair(id_size, key_size);
    var index = allStudent.findIndex(x => x.id === pair.id);
    if(index === -1){
        allStudent.push(pair);

        let doc = generateDocument(pair, allCustodian, allReader);

        if(Math.random() < 0.75){
            initLedgerDocuments.push(doc);
        } else {
            benchmarkDocuments.push(doc);
        }


        i++;
    } else {
        console.log(`${pair.id} already exists`);
    }
}

const json = JSON.stringify({
    allReader: allReader,
    allCustodian: allCustodian,
    allStudent: allStudent,
    initLedgerDocuments: initLedgerDocuments,
    benchmarkDocuments: benchmarkDocuments
}, null, 4);

fs.writeFile('seeds.json', json, function(err) {
    if (err) {
        console.log(err);
    }
});

//console.log("=============================== Generate seeds.json done");

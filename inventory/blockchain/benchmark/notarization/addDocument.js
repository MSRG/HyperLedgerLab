/* eslint-disable no-undef */
'use strict';

const utils = require('./utils');
const seeds = require('./seeds.json');

class addDocument {

    static get() {
	    let args;

        let randomAccessKey = 0;

        do{
            randomAccessKey = utils.getRandomInt(seeds.benchmarkDocuments.length);
        } while(seeds.benchmarkDocuments[randomAccessKey] === undefined);

        let doc = seeds.benchmarkDocuments[randomAccessKey];


        // addDocument(ctx, documentHash, custodianId, custodianKey, studentId, studentKey)

	    args = {
                chaincodeFunction: 'addDocument',
                chaincodeArguments: [doc.documentHash, doc.custodian.id, doc.custodian.key, doc.student.id, doc.student.key]
            };

	    return args;

	}
}

module.exports = addDocument;

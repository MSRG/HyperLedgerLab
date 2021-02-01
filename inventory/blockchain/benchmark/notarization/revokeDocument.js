/* eslint-disable no-undef */
'use strict';

const utils = require('./utils');
const seeds = require('./seeds.json');

class revokeDocument {

    static get() {
	    let args;

        /*
            3 different scenario for this test
            1) get all data for arg random
            2) get random document from initLedgerDocuments
            3) get random document from benchmarkDocuments
        */

        let scenario = utils.getRandomInt(3);

        if(scenario === 0){

            // select random student
            let randomAccessKey = 0;
            do{
                randomAccessKey = utils.getRandomInt(seeds.allStudent.length);
            } while(seeds.allStudent[randomAccessKey] === undefined);

            let student = seeds.allStudent[randomAccessKey];

            // select random custodian
            randomAccessKey = 0;
            do{
                randomAccessKey = utils.getRandomInt(seeds.allCustodian.length);
            } while(seeds.allCustodian[randomAccessKey] === undefined);

            let custodian = seeds.allCustodian[randomAccessKey];

            // revokeDocument(ctx, custodianId, studentId, custodianKey)

            args = {
                    chaincodeFunction: 'revokeDocument',
                    chaincodeArguments: [custodian.id, student.id, custodian.key]
                };

        } else if (scenario == 1){

            // select random document from initLedgerDocuments
            let randomAccessKey = 0;
            do{
                randomAccessKey = utils.getRandomInt(seeds.allCustodian.length);
            } while(seeds.initLedgerDocuments[randomAccessKey] === undefined);

            let doc = seeds.initLedgerDocuments[randomAccessKey];

            // revokeDocument(ctx, custodianId, studentId, custodianKey)

            args = {
                    chaincodeFunction: 'revokeDocument',
                    chaincodeArguments: [doc.custodian.id, doc.student.id, doc.custodian.key]
                };

        } else {
            
            // select random document from benchmarkDocuments
            let randomAccessKey = 0;
            do{
                randomAccessKey = utils.getRandomInt(seeds.allCustodian.length);
            } while(seeds.benchmarkDocuments[randomAccessKey] === undefined);

            let doc = seeds.benchmarkDocuments[randomAccessKey];

            // revokeDocument(ctx, custodianId, studentId, custodianKey)

            args = {
                    chaincodeFunction: 'revokeDocument',
                    chaincodeArguments: [doc.custodian.id, doc.student.id, doc.custodian.key]
                };

        }

	    return args;

	}
}

module.exports = revokeDocument;

/* eslint-disable no-undef */
'use strict';

const utils = require('./utils');
const seeds = require('./seeds.json');

class getDocumentValue {

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

            // select random reader
            let randomAccessKey = 0;
            do{
                randomAccessKey = utils.getRandomInt(seeds.allReader.length);
            } while(seeds.allReader[randomAccessKey] === undefined);

            let reader = seeds.allReader[randomAccessKey];      

            // select random student
            randomAccessKey = 0;
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

            // getDocumentValue(ctx, custodianId, studentId, readerName)

            args = {
                    chaincodeFunction: 'getDocumentValue',
                    chaincodeArguments: [custodian.id, student.id, reader]
                };

        } else if (scenario == 1){

            // select random reader
            let randomAccessKey = 0;
            do{
                randomAccessKey = utils.getRandomInt(seeds.allReader.length);
            } while(seeds.allReader[randomAccessKey] === undefined);

            let reader = seeds.allReader[randomAccessKey];    

            // select random document from initLedgerDocuments
            randomAccessKey = 0;
            do{
                randomAccessKey = utils.getRandomInt(seeds.allCustodian.length);
            } while(seeds.initLedgerDocuments[randomAccessKey] === undefined);

            let doc = seeds.initLedgerDocuments[randomAccessKey];

            // getDocumentValue(ctx, custodianId, studentId, readerName)

            args = {
                    chaincodeFunction: 'getDocumentValue',
                    chaincodeArguments: [doc.custodian.id, doc.student.id, reader]
                };

        } else {
            
            // select random reader
            let randomAccessKey = 0;
            do{
                randomAccessKey = utils.getRandomInt(seeds.allReader.length);
            } while(seeds.allReader[randomAccessKey] === undefined);

            let reader = seeds.allReader[randomAccessKey];    

            // select random document from benchmarkDocuments
            randomAccessKey = 0;
            do{
                randomAccessKey = utils.getRandomInt(seeds.allCustodian.length);
            } while(seeds.benchmarkDocuments[randomAccessKey] === undefined);

            let doc = seeds.benchmarkDocuments[randomAccessKey];

            // getDocumentValue(ctx, custodianId, studentId, readerName)

            args = {
                    chaincodeFunction: 'getDocumentValue',
                    chaincodeArguments: [doc.custodian.id, doc.student.id, reader]
                };

        }

	    return args;

	}
}

module.exports = getDocumentValue;

/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const MyDocument = require('./mydocument')
const sha512 = require('js-sha512');

const seeds = require('./seeds.json');


class NotarizationContract extends Contract {

    async init(ctx) {
        console.info('Notarization Contract Initialized');
    }

    async doNothing(ctx) {
        console.log('=========== DoNothing Function');
    }

    async initLedger(ctx) {
        console.log('=========== START: initLedger Transaction');

        for(const doc of seeds.allDocument){
            // create key for storing data
            let key = doc.custodian.id.toString() + doc.student.id.toString();

            // create document object
            let custodianHash = sha512(doc.custodian.key);
            let studentHash = sha512(doc.student.key);
            let newdoc = new MyDocument(doc.documentHash, doc.custodian.id, custodianHash, doc.student.id, studentHash);

            // save document to the state
            await ctx.stub.putState(key, Buffer.from(JSON.stringify(newdoc)));
        }

        console.log('=========== END  : initLedger Transaction');
    }

    async addDocument(ctx, documentHash, custodianId, custodianKey, studentId, studentKey) {
        console.log('=========== START: addDocument Transaction');

        // check all input params
        if(documentHash.length <= 0){
            throw new Error("documentHash must be a non-empty string");
        }
        if(custodianId.length <= 0){
            throw new Error("custodianId must be a non-empty string");
        }
        if(custodianKey.length <= 0){
            throw new Error("custodianKey must be a non-empty string");
        }
        if(studentId.length <= 0){
            throw new Error("studentId must be a non-empty string");
        }
        if(studentKey.length <= 0){
            throw new Error("studentKey must be a non-empty string");
        }

        // create key for storing data
        let key = custodianId.toString() + studentId.toString();

        // check if that key already existes
        let check = await ctx.stub.getState(key);
        if(check.toString()) {
            throw new Error(`There is already input for student ${studentId} from ${custodianId}`);
        }

        // create document object
        let custodianHash = sha512(custodianKey);
        let studentHash = sha512(studentKey);
        let newdoc = new MyDocument(documentHash, custodianId, custodianHash, studentId, studentHash);

        // save document to the state
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(newdoc)));

        console.log('=========== END  : addDocument Transaction');
    }

    async getDocumentValue(ctx, custodianId, studentId, readerName) {
        console.log('=========== START: getDocumentValue Transaction');

        // check all input params
        if(custodianId.length <=0){
            throw new Error('CustodianId must be non-empty string');
        }
        if(studentId.length <= 0){
            throw new Error('StudentId must be non-empty string')
        }
        if(readerName.length <= 0){
            throw new Error('ReaderName must be non-empty string')
        }

        // create key for entity
        let key = custodianId.toString() + studentId.toString();

        // retrive entity from ledger
        let docAsBytes = await ctx.stub.getState(key);
        if(!docAsBytes || !docAsBytes.toString()) {
            throw new Error(`Document for student ${studentId} from ${custodianId} doesnt exist`);
        }

        let docjson = {};
        try {
            docjson = JSON.parse(docAsBytes.toString());
        } catch(err) {
            let responsejson = {};
            responsejson.description = `Failed to decode JSON for student ${studentId} from ${custodianId} doesnt exist`;
            responsejson.error = err.description;
            throw new Error(responsejson);
        }
        let doc = MyDocument.fromJSON(docjson);

        // add reader to readers list
        doc.addReader(readerName);
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(doc)));

        // return document hash
        console.log('=========== END  : getDocumentValue Transaction');
        return doc.getMetadata();
    }

    async revokeDocument(ctx, custodianId, studentId, custodianKey) {
        console.log('=========== START: revokeDocument Transaction');

        // check all input params
        if(custodianId.length <=0){
            throw new Error('CustodianId must be non-empty string');
        }
        if(studentId.length <= 0){
            throw new Error('StudentId must be non-empty string')
        }
        if(custodianKey.length <= 0){
            throw new Error('custodianKey must be non-empty string')
        }

        // create key for entity
        let key = custodianId.toString() + studentId.toString();

        // retrive entity from ledger
        let docAsBytes = await ctx.stub.getState(key);
        if(!docAsBytes || !docAsBytes.toString()) {
            throw new Error(`Document for student ${studentId} from ${custodianId} doesnt exist`);
        }

        let docjson = {};
        try {
            docjson = JSON.parse(docAsBytes.toString());
        } catch(err) {
            let responsejson = {};
            responsejson.description = `Failed to decode JSON for student ${studentId} from ${custodianId} doesnt exist`;
            responsejson.error = err.description;
            throw new Error(responsejson);
        }
        let doc = MyDocument.fromJSON(docjson);

        // check if custodian can revoke document
        let hashedKey = sha512(custodianKey);
        if (hashedKey === doc.custodianHash){
            // revoke document
            doc.setRevoked();
            await ctx.stub.putState(key, Buffer.from(JSON.stringify(doc)));

            console.log('=========== END  : revokeDocument Transaction');
            return doc.getMetadata();
        }

        console.log('=========== END  : revokeDocument Transaction');
    }

    async getAllDocumentReaders(ctx, custodianId, studentId, studentKey) {
        console.log('=========== START: addAllDocumentReaders Transaction');

        // check all input params
        if(custodianId.length <=0){
            throw new Error('CustodianId must be non-empty string');
        }
        if(studentId.length <= 0){
            throw new Error('StudentId must be non-empty string')
        }
        if(studentKey.length <= 0){
            throw new Error('studentKey must be non-empty string')
        }

        // create key for entity
        let key = custodianId.toString() + studentId.toString();

        // retrive entity from ledger
        let docAsBytes = await ctx.stub.getState(key);
        if(!docAsBytes || !docAsBytes.toString()) {
            throw new Error(`Document for student ${studentId} from ${custodianId} doesnt exist`);
        }

        let docjson = {};
        try {
            docjson = JSON.parse(docAsBytes.toString());
        } catch(err) {
            let responsejson = {};
            responsejson.description = `Failed to decode JSON for student ${studentId} from ${custodianId} doesnt exist`;
            responsejson.error = err.description;
            throw new Error(responsejson);
        }
        let doc = MyDocument.fromJSON(docjson);

        // check if student can revoke get list of all readers
        let hashedKey = sha512(studentKey);
        if (hashedKey === doc.studentHash){
            // get list of all readers
            let metadata = doc.getMetadata();
            metadata.readers = doc.getAllReaders();

            console.log('=========== END  : addAllDocumentReaders Transaction');
            return metadata;
        }

        console.log('=========== END  : addAllDocumentReaders Transaction');
    }
}

module.exports = NotarizationContract;

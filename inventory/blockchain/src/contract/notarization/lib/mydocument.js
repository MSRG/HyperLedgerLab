'use strict';

/**
 *
 */

const cvalid = 'valid';
const crevoked = 'revoked';

class MyDocument {

    constructor(documentHash, custodianId, custodianHash, studentId, studentHash, readerList) {
        this.docType = 'my-document';
        this.documentHash = documentHash;
        this.custodianId = custodianId;
        this.custodianHash = custodianHash;
        this.studentId = studentId;
        this.studentHash = studentHash;
        this.status = cvalid;
        this.readerList = (readerList === undefined) ? [] : readerList;
    }

    setRevoked() {
        this.status = crevoked;
    }

    getStatus() {
        return this.status;
    }

    addReader(readerName) {
        if(!this.readerList.includes(readerName)) {
            this.readerList.push(readerName);
        }
    }

    getAllReaders(){
        return this.readerList;
    }

    getMetadata(){
        var metadata = {
            document_hash: this.documentHash,
            document_value: this.status,
            custodian_id: this.custodianId,
            student_id: this.studentId
        };
        return metadata;
    }

    static fromJSON(obj) {
        if (obj.documentHash !== undefined && obj.custodianId !== undefined && obj.custodianHash !== undefined && obj.studentId !== undefined && obj.studentHash !== undefined) {
            return new MyDocument(obj.documentHash, obj.custodianId, obj.custodianHash, obj.studentId, obj.studentHash, obj.readerList);
        }
    }
}

module.exports = MyDocument;
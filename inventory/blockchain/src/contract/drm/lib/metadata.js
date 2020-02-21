'use strict';

/**
 *
 */

class Metadata {
    constructor(metadata, royaltyManagementId) {
        this.docType = 'metadata';
        this.metadata = metadata;
        this.royaltyManagementId = royaltyManagementId;
    }

    static fromJSON(obj) {
        if (obj.metadata !== undefined && obj.royaltyManagementId !== undefined) {
            return new Metadata(obj.metadata, obj. royaltyManagementId);
        }
    }
}

module.exports = Metadata;
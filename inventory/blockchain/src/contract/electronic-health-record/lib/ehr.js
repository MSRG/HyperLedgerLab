'use strict';

/**
 * A record containing metadata about an electronic health record, it includes:
 * - the remote ressource location
 * - access key
 * - access list
 */

class Ehr {
    constructor(hashedKey, ressource, accessList) {
        this.docType = 'ehr';
        this.hashedKey = hashedKey;
        this.ressource = ressource;
        this.accessList = (accessList === undefined) ? [] : accessList;
    }

    addToAccessList(actorId) {
        if (!this.accessList.includes(actorId)) {
            this.accessList.push(actorId);
        }
    }

    removeFromAccessList(actorId) {
        this.accessList.splice(this.accessList.indexOf(actorId));
    }

    hasAccess(actorId) {
        return this.accessList.includes(actorId);
    }

    static fromJSON(obj) {
        if (obj.hashedKey !== undefined && obj.ressource !== undefined) {
            return new Ehr(obj.hashedKey, obj.ressource, obj.accessList);
        }
        throw new Error(`Could not construct Ehr from ${obj}`);
    }
}

module.exports = Ehr;
'use strict';

/**
 * A patient profile, it includes:
 * - personal information
 * - hashed access key to the record
 * - pointers to EHRs
 * - access lists for Physicians allowed to update the patient profile (add EHR)
 */

class Profile {
    constructor(hashedKey, patientName, age, allEhr, accessList) {
        this.docType = 'profile';
        this.hashedKey = hashedKey;
        this.patientName = patientName;
        this.age = age;
        this.allEhr = (allEhr === undefined) ? [] : allEhr; // {id, accessList}
        this.accessList = (accessList === undefined) ? [] : accessList;
    }

    static fromJSON(obj) {
        if (obj.hashedKey !== undefined && obj.patientName !== undefined, obj.age !== undefined) {
            return new Profile(obj.hashedKey, obj.patientName, obj.age, obj.allEhr, obj.accessList);
        }
        throw new Error(`Could not construct Profile from ${obj}`);
    }

    // Function for the use of the patient

    /**
     * Adds write permission to the allEhr for an actor if the provided key matches the record key
     * @param {String} hashedKey
     * @param {String} actorId
     */
    grantProfileAccess(hashedKey, actorId) {
        if (hashedKey === this.hashedKey) {
            if (!this.accessList.includes(Number.parseInt(actorId))) {
                this.accessList.push(Number.parseInt(actorId));
            }
        }
    }

    /**
     * Removes the write permission to the allEhr for an actor if the provided key matches the record key
     * @param {String} hashedKey
     * @param {String} actorId
     */
    revokeProfileAccess(hashedKey, actorId) {
        if (hashedKey === this.hashedKey) {
            this.accessList.splice(this.accessList.indexOf(Number.parseInt(actorId)));
        }
    }

    /**
     * Adds access patients EHRs if the supplied key matches
     * @param {String} hashedKey
     * @param {String} actorId
     * @param {String} ehrID
     */
    grantEHRAccess(hashedKey, actorId, ehrID) {
        if (hashedKey === this.hashedKey) {
            let allEhr = this.allEhr.filter(ehr => ehr.id === ehrID);
            // will be just one entry
            allEhr.forEach(ehr => {
                if (!ehr.accessList.includes(Number.parseInt(actorId))) {
                    ehr.accessList.push(Number.parseInt(actorId));
                }
            });
        }
    }

    /**
     * Revokes access patients EHRs if the supplied key matches
     * @param {String} hashedKey
     * @param {String} actorId
     * @param {String} ehrID
     */
    revokeEHRAccess(hashedKey, actorId, ehrID) {
        if (hashedKey === this.hashedKey) {
            let allEhr = this.allEhr.filter(ehr => ehr.id === ehrID);
            // will be just one entry
            allEhr.forEach(ehr => {
                ehr.accessList.splice(ehr.accessList.indexOf(Number.parseInt(actorId)));
            });
        }
    }

    // The following functions will be carried out in the context of some other actor
    // accessing the patients profile.

    /**
     * Returns a patients name and a subset of all the EHRs the actor has access to
     * @param {String} actorId
     */
    viewPartialProfile(actorId) {
        let allEhr = this.allEhr.filter(ehr => ehr.accessList.includes(Number.parseInt(actorId)));
        return {
            patientName: this.patientName,
            allEhr: allEhr
        };
    }

    /**
     * Adds a EHR to a patients profile and allows access to the physician creating it
     * @param {String} actorId
     * @param {String} ehrId
     */
    addEHR(actorId, ehrId) {
        if (this.accessList.includes(Number.parseInt(actorId))) {
            if (this.allEhr.every(ehr => ehr.id !== ehrId)) {
                this.allEhr.push(
                    {
                        id: ehrId,
                        accessList: [Number.parseInt(actorId)]
                    }
                );
            } else {
                throw Error('Could add EHR, actor has no access to Patient Profile.');
            }
        }
    }
}
module.exports = Profile;
/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const GLN = require('./gs1/gln.js');
const SSCC = require('./gs1/sscc.js');
const LSP = require('./logistics/lsp.js');
const Pallet  = require('./logistics/pallet.js');
const PalletGroup = require('./logistics/palletGroup.js');
const Helpers = require('./logistics/helper.js');
const seeds = require('./seeds.json');

//const { Contract } = require('fabric-contract-api');

//const ClientIdentity = require('fabric-shim').ClientIdentity;

class SupplychainV3Contract extends Contract {

    /*async beforeTransaction(ctx){
        let cid = new ClientIdentity(ctx.stub);
        console.info(`Transaction from: ${cid.getX509Certificate()}`);
        console.info(`Transaction ID: ${ctx.stub.getTxID()}`);
    }*/

    async init(ctx) {
        console.info('============= Init Supplychain Smartcontract ===========');
    }

    async doNothing(ctx) {
        console.info('============= DoNothing Function ===========');
    }


    async initLedger(ctx) {
        console.error('============= START : Initialize Ledger ===========');
	/*for (let [key, value] of Object.entries(seeds.allLogisticUnit)) {
		const sscc = key;
		//const docType = docType.fromJSON(value);
		//const docTypeString = JSON.stringify(docType));
		//let logisticUnit = undefined;
		//if (docTypeString === 'palletGroup') {
		logisticUnit = PalletGroup.fromJSON(value);
		if (JSON.stringify(logisticUnit) != '{}') {
			const buffer = Buffer.from(JSON.stringify(logisticUnit));
			await ctx.stub.putState(sscc, buffer);
		}
	}
	for (let [key, value] of Object.entries(seeds.allLogisticUnit)) {
                const sscc = key;
		logisticUnit = Pallet.fromJSON(value);
		if (JSON.stringify(logisticUnit) != '{}') {
			const buffer = Buffer.from(JSON.stringify(logisticUnit));
	                await ctx.stub.putState(sscc, buffer);
		}
	}*/
        for (let i = 0; i < (seeds.allLogisticUnit.length); i++) {
	    console.error('IN FOR');
            const sscc = SSCC.fromJSON(seeds.allLogisticUnit[i].sscc);
            let logisticUnit = undefined;
            if (seeds.allLogisticUnit[i].docType === 'palletGroup') {
		console.error('IN IF');
                logisticUnit = PalletGroup.fromJSON(seeds.allLogisticUnit[i]);
                const buffer = Buffer.from(JSON.stringify(logisticUnit));
		const ssccKey = sscc.toString();
		await ctx.stub.putState(ssccKey, buffer);
		//await this.pushLogisticUnit(ctx, sscc, logisticUnit);
            } else if (seeds.allLogisticUnit[i].docType === 'pallet') {
		console.error('IN ELSE');
                logisticUnit = Pallet.fromJSON(seeds.allLogisticUnit[i]);
                //await this.pushLogisticUnit(ctx, sscc, logisticUnit);
		const ssccKey = sscc.toString();
		const buffer = Buffer.from(JSON.stringify(logisticUnit));
                await ctx.stub.putState(ssccKey, buffer);
            }
        }
        console.error('============= END : Initialize Ledger ===========');
    }



    /**
     * Write a the AdavancedShippingNotice (ASN) for a given logisticUnit to the state store.
     * @param {Context} ctx Transaction context
     * @param {string} ssccKey String representation of the unique identifier for a logistic unit
     * @param {string} lsp String representation of the target LSP
     * @param {Date} date Date specifing the estimated arrival of the logistUnit at the target LSP
     */
    async pushASN(ctx, ssccKey, lspName, date) {
        console.info('============= START : Push ASN ===========');
        let asnIndexKey = await ctx.stub.createCompositeKey(lspName, [ssccKey]);
        console.info(`ASN: ${ssccKey} to ${lspName} at ${date}`);
        await ctx.stub.putState(asnIndexKey, JSON.stringify(date));
        console.info('============= END : Push ASN ===========');

	/*for (let i = 0; i < seeds.allLogisticUnit.length; i++) {
            const sscc = SSCC.fromJSON(seeds.allLogisticUnit[i].sscc);
            let logisticUnit = undefined;
            if (seeds.allLogisticUnit[i].docType === 'palletGroup') {
                logisticUnit = PalletGroup.fromJSON(seeds.allLogisticUnit[i]);
                const buffer = Buffer.from(JSON.stringify(logisticUnit));
                const ssccKey = sscc.toString();
                await ctx.stub.putState(ssccKey, buffer);
                //await this.pushLogisticUnit(ctx, sscc, logisticUnit);
            } else if (seeds.allLogisticUnit[i].docType === 'pallet') {
                logisticUnit = Pallet.fromJSON(seeds.allLogisticUnit[i]);
                //await this.pushLogisticUnit(ctx, sscc, logisticUnit);
                const ssccKey = sscc.toString();
                const buffer = Buffer.from(JSON.stringify(logisticUnit));
                await ctx.stub.putState(ssccKey, buffer);
            }
        }*/

    }

    /**
     * Query AdavancedShippingNotice (ASN) for a given LSP
     * @param {Context} ctx Transaction context
     * @param {*} lsp Name of the LSP to view ASNs which were directed to it.
     */
    async queryASN(ctx, lspName) {
        console.info('============= START : Query ASN ===========');
        let asnResultsIterator = await ctx.stub.getStateByPartialCompositeKey(lspName, []);
        const allResult = await Helpers.handleStateQueryIterator(asnResultsIterator);
        console.info('============= END : Query ASN ===========');
        return allResult;
    }

    /**
     * Write a logistUnit to the state store by adding the logistUnit
     * as a value to a composite key of lsp name and logistUnit sscc.
     * @param {Context} ctx Transaction context
     * @param {string} ssccKey String representation of the unique identifier for a logistic unit
     * @param {LogisticUnit} logisticUnit
     */
    async pushLogisticUnit(ctx, sscc, logisticUnit) {
        console.info('============= START : Push Logistic Unit ===========');
        const ssccKey = sscc.toString();
        console.info(JSON.stringify(ssccKey));
        const value = Buffer.from(JSON.stringify(logisticUnit));
        await ctx.stub.putState(ssccKey, value);
        console.info('============= END : Push Logistic Unit ===========');
    }

    /**
     * Query a logistic units by its SSCC - the SSCC is passed as a string
     * and assembled for querying the state. Upon successful retrieval the
     * logistic unit is unmarshalled and a class instance of the queried object
     * is returned.
     * @param {Context} ctx Transaction context
     * @param {string} lspName Identifies the LSP by its common name
     * @param {string} ssccKey String representation of the unique identifier for a logistic unit
     */
    async queryLogisticUnit(ctx, ssccKey) {
        console.info('============= START : Query Logistic Unit ===========');
        let logistiUnitAsBytes = await ctx.stub.getState(ssccKey);
        const result = await Helpers.handleSingleQueryResult(logistiUnitAsBytes);
        console.log(result);
        console.info('============= END : Query Logistic Unit ===========');
        // this should produce exactly one element, since the above key is unique
        return result;
    }

    /**
     * Query the state for all logistiUnits which are
     * currently stored at the supplied logistic service provider.
     * We use a partial composite key querying the state just by using
     * the prefix and a the lsp name.
     * @param {Context} ctx Transaction context
     * @param {string} lspName Identifies the LSP by its common name
     */
    async queryStock(ctx, lspName) {
        console.info('============= START : Query Stock at LSP ===========');
        console.info(JSON.stringify(lspName));
        let queryString = {};
        queryString.selector = {};
        queryString.selector.lsp = {};
        queryString.selector.lsp.name = lspName;

        let resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));

        if (!resultsIterator) {
            console.log(`${lspName} does not exist`);
            // throw new Error(`${lspName} does not exist`);
        }
        const allResult = await Helpers.handleStateQueryIterator(resultsIterator);
        console.info('============= END : Query Stock at LSP ===========');
        return allResult;
    }

    /**
     * Ship a logistic unit from one LSP to an other
     * this will update the logistic units lsp field
     * in the world state. We change the lsp field in
     * the logistic unit, delete the old entry in the
     * state and push the updated logitstic unit with
     * a new key (new_lsp, ssccKey).
     * @param {Context} ctx Transaction context
     * @param {string} ssccKey String representation of the unique identifier for a logistic unit
     * @param {string} newLSPNameString
     * @param {string} newLSPGlnString
     */
    async ship(ctx, ssccKey, newLSPNameString, newLSPGlnString) {
        console.info('============= START : ship ===========');
        const logisticUnit = await this.queryLogisticUnit(ctx, ssccKey);
        if (logisticUnit === undefined) {
            console.info(`${ssccKey} not found`);
            // throw new Error(`${ssccKey} not found`);
        } else {
            if (!logisticUnit.ready) {
                console.info(`${ssccKey} is not ready`);
                // throw new Error(`${ssccKey} is not ready`);
            } else {
                const newLspGln = GLN.fromString(newLSPGlnString);
                const newLsp = new LSP(newLSPNameString, newLspGln.gs1CompanyPrefix, newLspGln.locationReference, newLspGln.checkDigit);

                if (newLsp.toString() === logisticUnit.lsp.toString()) {
                    console.log(`Already at this lsp ${newLsp}`);
                    // throw new Error(`Already at this lsp ${newLsp}`);
                }
                // set logistic unit location
                logisticUnit.location = newLsp;
                if (logisticUnit.docType === 'palletGroup') {
                    if (logisticUnit.contains !== undefined) {
                        await logisticUnit.contains.forEach( async (palletSsccKey) => {
                            const palletJSON = await this.queryLogisticUnit(ctx, palletSsccKey);
                            const pallet = Pallet.fromJSON(palletJSON);
                            pallet.location = newLsp;
                            await this.pushLogisticUnit(ctx, palletSsccKey, pallet);
                        });
                    }
                }
                await this.pushLogisticUnit(ctx, ssccKey, logisticUnit);
            }
            console.info('============= END : ship ===========');
            return;
        }
    }

    /**
     * Extract the contained logististUnits from a given logisticUnit
     * palletGroups containing pallets are deleted and the contained
     * pallets are now available in the state.
     * @param {Context} ctx Transaction context
     * @param {string} ssccKey String representation of the unique identifier for a logistic unit
     */
    async unload(ctx, ssccKey) {
        console.info('============= START : unload ===========');
        const logisticUnit = await this.queryLogisticUnit(ctx, ssccKey);
        if (logisticUnit === undefined) {
            console.info(`${ssccKey} not found`);
            // throw new Error(`${ssccKey} not found`);
        } else {
            if (!logisticUnit.ready) {
                // throw new Error(`${ssccKey} is not ready`);
                console.info(`${ssccKey} is not ready`);
            } else {
                // add contained logistic units to ledger - this will only add pallets
                // there for we just deal with palletGroups here:
                if (logisticUnit.docType === 'palletGroup') {
                    if (logisticUnit.contains !== undefined) {
                        if (logisticUnit.docType === 'palletGroup') {
                            await logisticUnit.contains.forEach( async (palletSsccKey) => {
                                const palletJSON = await this.queryLogisticUnit(ctx, palletSsccKey);
                                const pallet = Pallet.fromJSON(palletJSON);
                                pallet.ready = true;
                                await this.pushLogisticUnit(ctx, palletSsccKey, pallet);
                            });
                        }
                    }
                }
                logisticUnit.ready = false;
                await this.pushLogisticUnit(ctx, ssccKey, logisticUnit);
            }
        }
        console.info('============= END : unload ===========');
    }
}

module.exports = SupplychainV3Contract;

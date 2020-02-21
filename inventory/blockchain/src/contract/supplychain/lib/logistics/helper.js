'use strict';

const PalletGroup = require('./palletGroup');
const Pallet = require('./pallet');

class Helpers {
    /**
     * Helper method to process a set of returned objects by a iterator-producing query
     * @param {StateQueryIterator} iterator
     */
    static async handleStateQueryIterator(iterator) {
        let resultArray = [];
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                try {
                    const json = JSON.parse(res.value.value.toString('utf8'));
                    if (json.docType === 'palletGroup') {
                        const result = PalletGroup.fromJSON(json);
                        result.docType = 'palletGroup';
                        resultArray.push(result);
                    } else if (json.docType === 'pallet') {
                        const result = Pallet.fromJSON(json);
                        result.docType = 'pallet';
                        resultArray.push(result);
                    } else {
                        resultArray.push(json);
                    }
                } catch (err) {
                    console.log(err);
                }
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(resultArray);
                return resultArray;
            }
        }
    }

    /**
     * Helper method to process a single object returned by a query
     */
    static handleSingleQueryResult(valAsBytes) {
        let json = {};
        let result = {};
        try {
            json = JSON.parse(valAsBytes.toString());
            if (json.docType === 'palletGroup') {
                result = PalletGroup.fromJSON(json);
                result.docType = 'palletGroup';
            } else if (json.docType === 'pallet') {
                result = Pallet.fromJSON(json);
                result.docType = 'pallet';
            }
            return result;
        } catch (err) {
            throw new Error(err);
        }
    }
}

module.exports = Helpers;

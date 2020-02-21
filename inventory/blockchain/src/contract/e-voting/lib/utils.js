'use strict';

const Election = require('./election');
const Ballot = require('./ballot');
const Party = require('./party');

class Utils {
    static handleStateQueryResult(valAsBytes) {
        let json = {};
        let result = {};
        try {
            json = JSON.parse(valAsBytes.toString());
            if (json.docType === 'election') {
                result = Election.fromJSON(json);
            } else if (json.docType === 'ballot') {
                result = Ballot.fromJSON(json);
            } else if (json.docType === 'party') {
                result = Party.fromJSON(json);
            }
            return result;
        } catch (err) {
            console.info(err);
        }
    }

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
                    let result = {};
                    if (json.docType === 'election') {
                        result = Election.fromJSON(json);
                        resultArray.push(result);
                    } else if (json.docType === 'ballot') {
                        result = Ballot.fromJSON(json);
                        resultArray.push(result);
                    } else if (json.docType === 'party') {
                        result = Party.fromJSON(json);
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

    static generateRandomNumberString(len) {
        let string = '';
        for (let i = 0; i < len; i++) {
            string += this.getRandomInt();
        }
        return string;
    }

    static getRandomInt() {
        const min = Math.ceil(0);
        const max = Math.floor(9);
        return (Math.floor(Math.random() * (max - min)) + min);
    }

    static oneOrTwo() {
        return (Math.random() < 0.5);
    }

    static randomChoiceFromArray(array) {
        let index = Math.round(( Math.random() * array.length - 1));
        while (array[index] === undefined) {
            index = Math.round(( Math.random() * array.length - 1));
        }
        return array[index];
    }
}

module.exports = Utils;
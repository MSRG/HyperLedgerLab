'use strict';

class Utils {
    static calculateCheckDigit(dataStructure) {
        // multiply by 3 if the index is positve, else pass as is
        const multiply = (acc, cur, index) => (acc + cur * (index % 2 === 0 ? 3 : 1));
        // see GS1 7.9.1
        let sum = dataStructure.split('').reverse().map(x => Number.parseInt(x, 10)).reduce(multiply, 0);
        return (10 - sum % 10) % 10;
    }
    static getRandomInt() {
        const min = Math.ceil(0);
        const max = Math.floor(9);
        return (Math.floor(Math.random() * (max - min)) + min);
    }
}

module.exports = Utils;

'use strict';

const RandExp = require('randexp');

class Utils {
   
    static generateRandomString(len) {
        return new RandExp('.{'+ len +'}').gen();
    }

    static getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
      
}

module.exports = Utils;
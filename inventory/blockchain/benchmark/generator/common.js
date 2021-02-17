'use strict';


var fs = require('fs');
const zeroPad = (num, places) => String(num).padStart(places, '0')


let index = 0
let fileIndex = 0
let txIndex = 0
let filearray = [];
let err = 0
let nclients = 25
let ntransactions = 144000
let tranperclient = ntransactions/nclients 

module.exports.info = 'Chaincode function randomizer';

let bc, contx;

module.exports.init = function (blockchain, context, args) {
    bc = blockchain;
    contx = context;
    return Promise.resolve();
};
module.exports.run = function (clientIdx) {

	let args;
        let argsj;
	
	if (txIndex == 0) {
	
                filearray = fs.readFileSync(__dirname + '/workload/wdeleteheavy' + zeroPad(clientIdx, 2)).toString().split("\n");
	}

	args = 	filearray[txIndex]	

	txIndex++;

	argsj = JSON.parse(args);


	return bc.invokeSmartContract(
        contx,
        'generator',
        'v1',
        [argsj],
        30
    );


};


module.exports.end = function () {
filearray = [];
return Promise.resolve();
};


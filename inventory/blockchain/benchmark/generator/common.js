'use strict';


//Split files into number of clients
//split -l 5760 uniform_generatedtransactions.txt uniform -d


var fs = require('fs');
//const nthLine = require('read-nth-line');
const zeroPad = (num, places) => String(num).padStart(places, '0')


//var AsyncLock = require('async-lock');
//var lock = new AsyncLock();
//let pidArray = [];
let index = 0
let fileIndex = 0
let txIndex = 0
let filearray = [];
let err = 0
//let ret = 0
let nclients = 25
let ntransactions = 144000
//let ntransactions = 90000
let tranperclient = ntransactions/nclients 

function isDefined(t) {
  if (t === undefined) {
     return false;
  }
  return true;
}


module.exports.info = 'Chaincode function randomizer';

let bc, contx;

module.exports.init = function (blockchain, context, args) {
    bc = blockchain;
    contx = context;
    return Promise.resolve();
};
module.exports.run = function (clientIdx) {

	//let filearray = [];
	let args;
        let argsj;
	
	
	//fileIndex = txIndex + (clientIdx * tranperclient);

	if (txIndex == 0) {
	
                filearray = fs.readFileSync(__dirname + '/workload/wnorangedeleteheavy' + zeroPad(clientIdx, 2)).toString().split("\n");
	}

	//if (filearray.length > 0) {
	args = 	filearray[txIndex]	
	//}

	txIndex++;
/*	console.log('ArrayLength')
	console.log(filearray.length)
        console.log(fileIndex)
	console.log(clientIdx)*/

	argsj = JSON.parse(args);
	//console.log(argsj)
/*	console.log('IN RUN FUNCTION');
	console.log(process.pid)
	console.log(fileIndex);
	console.log(clientIdx);
*/	


/*
	try {
//		console.log('IN TRY');
//		console.log(fileIndex);
                args = nthLine.readSync(__dirname + '/deleteheavy_generatedtransactions.txt', fileIndex);
//		console.log(args);
		argsj = JSON.parse(args);
//		console.log(argsj);
	} catch (err) {
                          console.log(err);
		 	  console.log('IN CATCH');
			  console.log(fileIndex);
                }

*/	
	

//	args = "{ \"chaincodeFunction\":\"func1\", \"chaincodeArguments\":\"[\'449\',\'715\']\" }"
//	argsj = JSON.parse(args);

    let txstatus = bc.invokeSmartContract(contx, 'generator', 'v1', [argsj], 30);

    txstatus.then(function(result) {
        //Latencies
        if (isDefined(result[0].Get('endorse_latency'))){
                console.info('endorse_latency: ', result[0].Get('endorse_latency'));
        }
        if (isDefined(result[0].Get('orderingandvalidation_time'))){
                console.info('orderingandvalidation_time: ', result[0].Get('orderingandvalidation_time'));
        }

    })

    return txstatus;

/*	return bc.invokeSmartContract(
        contx,
        'generator',
        'v1',
        [argsj],
        30
    );*/


	
 
/*	nthLine.read(__dirname + '/uniform_generatedtransactions.txt', fileIndex).then(result => {
	console.log('READING ASYNCHROUNOUSLY');
	console.log(result);
	args = result;
	argsj = JSON.parse(args);
	console.log(args);
	console.log(argsj);
        return bc.invokeSmartContract(contx, 'generator', 'v1', [argsj], 30);
	}).catch(err => {
  		console.warn(err);
		console.log('IN CATCH');
		console.log(fileIndex);
	});

*/


};


module.exports.end = function () {
filearray = [];
return Promise.resolve();
};





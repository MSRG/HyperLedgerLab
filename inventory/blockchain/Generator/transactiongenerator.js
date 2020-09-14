
var zipfian  = require("zipfian-integer")
var Picker = require('random-picker').Picker;
var picker = new Picker();
var deck = require('deck');
var fs = require('fs');


var transactionDistribution
var stream


var myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);
//case 0,1,2,3,4,5,6,7: uniform, readheavy, writeheavy, insertheavy, updateheavy, deleteheavy, rangeheavy, couchheavy
 //let transactionDistribution = [50, 10, 40, 0, 0, 0, 0, 0] //Percentage of read, insert, update, delete, range, donothing, couchdbquery, mixed
switch (myArgs[0]) {
case '0':
        //uniform
        //var transactionDistribution = [20, 20, 20, 20, 20, 0, 0, 0]
        var transactionDistribution = [50, 0, 50, 0, 0, 0, 0, 0]
        var stream = fs.createWriteStream("/home/ubuntu/HyperLedgerLab/inventory/blockchain/Generator/uniform_generatedtransactions.txt", {flags:'a'});
        break;
case '1':
        //readheavy
        var transactionDistribution = [80, 5, 5, 5, 5, 0, 0, 0]
        var stream = fs.createWriteStream("/home/ubuntu/HyperLedgerLab/inventory/blockchain/Generator/readheavy_generatedtransactions.txt", {flags:'a'});
        break;
case '2':
        //writeheavy
        var transactionDistribution = [10, 40, 40, 5, 5, 0, 0, 0]
        var stream = fs.createWriteStream("/home/ubuntu/HyperLedgerLab/inventory/blockchain/Generator/writeheavy_generatedtransactions.txt", {flags:'a'});
        break;
case '3':
        //insertheavy
        var transactionDistribution = [5, 80, 5, 5, 5, 0, 0, 0]
        var stream = fs.createWriteStream("/home/ubuntu/HyperLedgerLab/inventory/blockchain/Generator/insertheavy_generatedtransactions.txt", {flags:'a'});
        break;
case '4':
        //updateheavy
        var transactionDistribution = [5, 5, 80, 5, 5, 0, 0, 0]
        var stream = fs.createWriteStream("/home/ubuntu/HyperLedgerLab/inventory/blockchain/Generator/updateheavy_generatedtransactions.txt", {flags:'a'});
        break;
case '5':
        //deleteheavy
        var transactionDistribution = [5, 5, 5, 80, 5, 0, 0, 0]
        var stream = fs.createWriteStream("/home/ubuntu/HyperLedgerLab/inventory/blockchain/Generator/deleteheavy_generatedtransactions.txt", {flags:'a'});
        break;
case '6':
        //rangeheavy
        var transactionDistribution = [5, 5, 5, 5, 80, 0, 0, 0]
        var stream = fs.createWriteStream("/home/ubuntu/HyperLedgerLab/inventory/blockchain/Generator/rangeheavy_generatedtransactions.txt", {flags:'a'});
        break;
case '7':
        //couchdb
        var transactionDistribution = [5, 5, 5, 5, 0, 0, 80, 0]
        var stream = fs.createWriteStream("/home/ubuntu/HyperLedgerLab/inventory/blockchain/Generator/couchdbheavy_generatedtransactions.txt", {flags:'a'});
        break;
default:
        //uniform
        var transactionDistribution = [20, 20, 20, 20, 20, 0, 0, 0]
        var stream = fs.createWriteStream("/home/ubuntu/HyperLedgerLab/inventory/blockchain/Generator/uniform_generatedtransactions.txt", {flags:'a'});
}


                let totalTransactions = 144000  //duration * tps
                let keyDisttribution = 1 //Zipfian skew 0: uniform 1, -1 skewed

                //Index in funcdef
/*              let readFunctions = [0, 1, 2]
                let insertFunctions = [3, 4, 5]
                let updateFunctions = [6, 7, 8]
                let deleteFunctions = [9, 10, 11]
                //let rangeFunctions = [12, 13, 14]
                let rangeFunctions = [12]
                let doNothingFunctions = [0, 0, 0]
                let couchDBFunctions = [15, 16, 17]
                let mixedFunctions = [0, 0, 0]
*/


                let readFunctions = [0]
                let insertFunctions = [3]
                let updateFunctions = [6]
                let deleteFunctions = [9]
                let rangeFunctions = [12]
                let doNothingFunctions = [0]
                let couchDBFunctions = [15]
                let mixedFunctions = [0]



                //7 + 1 => {type of function, read, insert, update, delete, range, donothing, couchdbquery} in each function
                //type of function : 0 readonly, 1 insertonly, 2 updateonly, 3 deleteonly, 4 rangeonly, 5 donothingonly, 6 couchdbqueryonly, 7 mixed
                //let funcdef = [[0, 5, 0, 0, 0, 0, 0, 1], [1, 0, 2, 0, 0, 0, 0, 1], [2, 0, 0, 2, 0, 0, 0, 0], [3, 0, 0, 0, 2, 0, 0, 0]]
                let funcdef = [[0, 2, 0, 0, 0, 0, 0, 0], [0, 4, 0, 0, 0, 0, 0, 0], [0, 8, 0, 0, 0, 0, 0, 0], [1, 0, 2, 0, 0, 0, 0, 0], [1, 0, 4, 0, 0, 0, 0, 0], [1, 0, 8, 0, 0, 0, 0, 0], [2, 0, 0, 2, 0, 0, 0, 0], [2, 0, 0, 4, 0, 0, 0, 0], [2, 0, 0, 8, 0, 0, 0, 0], [3, 0, 0, 0, 2, 0, 0, 0], [3, 0, 0, 0, 4, 0, 0, 0], [3, 0, 0, 0, 8, 0, 0, 0], [4, 0, 0, 0, 0, 2, 0, 0], [4, 0, 0, 0, 0, 4, 0, 0], [4, 0, 0, 0, 0, 8, 0, 0], [6, 0, 0, 0, 0, 0, 0, 2], [6, 0, 0, 0, 0, 0, 0, 4], [6, 0, 0, 0, 0, 0, 0, 8]]
                let sizeKeySpace = 1000
                let dataType = 0 // 0: Numeral 1: Json String
                const constantMultiplier = 100
                //const rangeLength = [10, 20, 30, 40, 50]
                const rangeLength = [2, 4, 8]
                const couchQuery = ['\{\"selector\": \{\"$elemMatch\": \{\"value\": 100\"\"}}}', '\{\"selector\": \{\"$elemMatch\": \{\"value\": 100\"\"}}}', '\{\"selector\": \{\"$elemMatch\": \{\"value\": 100\"\"}}}']

                //TODO: MIXED FUNCTIONS DO NOT WORK
                //Get keys
                for (let i = 0; i < transactionDistribution.length; i++) {
                        picker.option(i, transactionDistribution[i])
                }


                let deletedKeys = [];

                for (let index = 0; index < totalTransactions; index++) {


                        let transactionType = picker.pick();
                        //Read
                        if (transactionType == 0) {
                                let pickedTransaction = deck.pick(readFunctions)
                                let numberOfArgs = funcdef[pickedTransaction][transactionType + 1]
                                let argments = new Array()
                                for (let i = 0; i < numberOfArgs; i++) {
                                        const keyfunc = zipfian(1, sizeKeySpace, keyDisttribution)
                                        let key = keyfunc()
                                        while(deletedKeys.indexOf(key) != -1){
                                                key = keyfunc()
                                                //console.log('r')
                                        }
                                        //console.log('outr')
                                        argments[i] = key.toString()
                                }
                                let functionNameIndex = pickedTransaction + 1
                                let functionName = 'func' + functionNameIndex
                                var quotedAndCommaSeparated = "\"" + argments.join("\",\"") + "\"";
                                let args = '\{ \"chaincodeFunction\":\"'+functionName+'\"\, \"chaincodeArguments\":['+quotedAndCommaSeparated+'] }'

                                stream.write(args + "\n");
                                //fs.writeFile('generatedtransactions.txt', args, function (err) {
                                //      if (err) return console.log(err);
                                //  });
                        }
                        //insert
                        if (transactionType == 1) {
                                let pickedTransaction = deck.pick(insertFunctions)
                                let numberOfArgs = funcdef[pickedTransaction][transactionType + 1] * 2
                                let argments = new Array()
                                for (let i = 0; i < numberOfArgs; i=i+2) {
                                        const keyfunc = zipfian(sizeKeySpace, sizeKeySpace*2, keyDisttribution)
                                        let key = keyfunc()
                                        while(deletedKeys.indexOf(key) != -1){
                                                key = keyfunc()
                                                //console.log('i')
                                        }
                                        //console.log('outi')
                                        argments[i] = key.toString()
                                        argments[i+1] = (key * constantMultiplier).toString()
                                }
                                let functionNameIndex = pickedTransaction + 1
                                let functionName = 'func' + functionNameIndex
                                var quotedAndCommaSeparated = "\"" + argments.join("\",\"") + "\"";
                                let args = '\{ \"chaincodeFunction\":\"'+functionName+'\"\, \"chaincodeArguments\":['+quotedAndCommaSeparated+'] }'
                                stream.write(args + "\n");
                        }
                        //update
                        if (transactionType == 2) {
                                let pickedTransaction = deck.pick(updateFunctions)
                                let numberOfArgs = funcdef[pickedTransaction][transactionType + 1] * 2
                                let argments = new Array()
                                for (let i = 0; i < numberOfArgs; i=i+2) {
                                        const keyfunc = zipfian(1, sizeKeySpace, keyDisttribution)
                                        let key = keyfunc()
                                        while(deletedKeys.indexOf(key) != -1){
                                                key = keyfunc()
                                                //console.log('u')
                                        }
                                        //console.log('outu')
                                        argments[i] = key.toString()
                                        argments[i+1] = constantMultiplier.toString()
                                }
                                let functionNameIndex = pickedTransaction + 1
                                let functionName = 'func' + functionNameIndex
                                var quotedAndCommaSeparated = "\"" + argments.join("\",\"") + "\"";
                                let args = '\{ \"chaincodeFunction\":\"'+functionName+'\"\, \"chaincodeArguments\":['+quotedAndCommaSeparated+'] }'
                                stream.write(args + "\n");

                        }
                        //delete
                        if (transactionType == 3) {
                                let pickedTransaction = deck.pick(deleteFunctions)
                                let numberOfArgs = funcdef[pickedTransaction][transactionType + 1]
                                let argments = new Array()
                                for (let i = 0; i < numberOfArgs; i++) {
                                        const keyfunc = zipfian(1, (sizeKeySpace - 2), keyDisttribution)
                                        let key = keyfunc()
                                        deletedKeys.push(key);
                                        argments[i] = key.toString()
                                }
                                let functionNameIndex = pickedTransaction + 1
                                let functionName = 'func' + functionNameIndex
                                var quotedAndCommaSeparated = "\"" + argments.join("\",\"") + "\"";
                                let args = '\{ \"chaincodeFunction\":\"'+functionName+'\"\, \"chaincodeArguments\":['+quotedAndCommaSeparated+'] }'
                                stream.write(args + "\n");

                        }
                        //range
                        if (transactionType == 4) {
                                let pickedTransaction = deck.pick(rangeFunctions)
                                let numberOfArgs = funcdef[pickedTransaction][transactionType + 1] * 2
                                let argments = new Array()
                                for (let i = 0; i < numberOfArgs; i=i+2) {
                                        const keyfunc = zipfian(1, sizeKeySpace, keyDisttribution)
                                        let key = keyfunc()
                                        while(deletedKeys.indexOf(key) != -1){
                                                key = keyfunc()
                                                //console.log('ran1')
                                        }
                                        //console.log('outran1')

                                        argments[i] = key.toString()
                                        let range = deck.pick(rangeLength)
                                        if ((key + range) >= sizeKeySpace) {
                                                argments[i+1] = (sizeKeySpace - 1).toString()
                                        }
                                        else {
                                                while((deletedKeys.indexOf(key + range) != -1) && (range > 0)){
                                                        range = range - 1
                                                        //console.log('ran2')
                                                }
                                                //console.log('outran2')

                                                argments[i+1] = (key + range).toString()
                                        }
                                }
                                let functionNameIndex = pickedTransaction + 1
                                let functionName = 'func' + functionNameIndex
                                var quotedAndCommaSeparated = "\"" + argments.join("\",\"") + "\"";
                                let args = '\{ \"chaincodeFunction\":\"'+functionName+'\"\, \"chaincodeArguments\":['+quotedAndCommaSeparated+'] }'
                                stream.write(args + "\n");
                        }
                        if (transactionType == 5) {
                                let pickedTransaction = deck.pick(doNothingFunctions)
                                let numberOfArgs = funcdef[pickedTransaction][transactionType + 1]
                                let argments = new Array()
                                for (let i = 0; i < numberOfArgs; i=i+2) {
                                        const keyfunc = zipfian(1, sizeKeySpace, keyDisttribution)
                                        let key = keyfunc()
                                        argments[i] = key.toString()
                                }
                                let functionNameIndex = pickedTransaction + 1
                                let functionName = 'func' + functionNameIndex
                                var quotedAndCommaSeparated = "\"" + argments.join("\",\"") + "\"";
                                let args = '\{ \"chaincodeFunction\":\"'+functionName+'\"\, \"chaincodeArguments\":['+quotedAndCommaSeparated+'] }'
                                stream.write(args + "\n");

                        }
                        if (transactionType == 7) {
                                let pickedTransaction = deck.pick(mixedFunctions)
                        }

                }
                stream.end();
//              return totalTransactions;

        //}
//}

//module.exports = TransactionGenerator;


/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

module.exports.info  = 'Initializing Electronic Health Record.';
//var AsyncLock = require('async-lock');
//var lock = new AsyncLock();

let txIndex = 0;
let keyIndex = 0;
let err = 0
let ret = 0
let bc, contx;

let nclients = 25
let ntransactions = 100000
let tranperclient = ntransactions/nclients


module.exports.init = function(blockchain, context, args) {
    bc = blockchain;
    contx = context;

    return Promise.resolve();
};

module.exports.run = function(clientIdx) {


    keyIndex = txIndex + (clientIdx * tranperclient);
    txIndex++;
    
/*    console.info('Inside INIT run function');
    console.info(process.pid);
    console.info(clientIdx);
    console.info(txIndex);
    console.info(keyIndex);*/
/*    lock.acquire(txIndex, function(done) {
                        // async work
			console.info('Inside INIT lock');
                        console.info(process.pid);
			txIndex++;
                        done(err, ret);
                }, function(err, ret) {
                        // lock released
                });
*/

    let args;
    let value = keyIndex * 100
    if (bc.bcType === 'fabric-ccp') {
        args = {
            chaincodeFunction: 'initLedger',
            chaincodeArguments: [keyIndex.toString(), value.toString()],
        };
    } else {
        args = {
            verb: 'initLedger'
        };
    }

    return bc.invokeSmartContract(contx, 'generator', 'v1', args, 30);
};

module.exports.end = function() {
    return Promise.resolve();
};

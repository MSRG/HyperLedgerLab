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

module.exports.info  = 'doNothing notarization';

let txIndex = 0;
let bc, contx;

module.exports.init = function(blockchain, context, args) {
    bc = blockchain;
    contx = context;

    return Promise.resolve();
};

module.exports.run = function() {
    txIndex++;

    let args;
    if (bc.bcType === 'fabric-ccp') {
        args = {
            chaincodeFunction: 'doNothing',
            chaincodeArguments: [],
        };
    } else {
        args = {
            verb: 'doNothing'
        };
    }

    return bc.invokeSmartContract(contx, 'notarization', 'v1', args, 30);
};

module.exports.end = function() {
    return Promise.resolve();
};

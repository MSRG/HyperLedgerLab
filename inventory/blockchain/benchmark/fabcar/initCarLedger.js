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

const { WorkloadModuleInterface  } = require('@hyperledger/caliper-core');

const colors = ['blue', 'red', 'green', 'yellow', 'black', 'purple', 'white', 'violet', 'indigo', 'brown'];
const makes = ['Toyota', 'Ford', 'Hyundai', 'Volkswagen', 'Tesla', 'Peugeot', 'Chery', 'Fiat', 'Tata', 'Holden'];
const models = ['Prius', 'Mustang', 'Tucson', 'Passat', 'S', '205', 'S22L', 'Punto', 'Nano', 'Barina'];
const owners = ['Tomoko', 'Brad', 'Jin Soo', 'Max', 'Adrianna', 'Michel', 'Aarav', 'Pari', 'Valeria', 'Shotaro'];


class InitCarLedgerWorkload extends WorkloadModuleInterface {
    constructor() {
        super();
        this.workerIndex = -1;
        this.totalWorkers = -1;
        this.roundIndex = -1;
        this.roundArguments = undefined;
        this.sutAdapter = undefined;
        this.sutContext = undefined;
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        this.workerIndex = workerIndex;
        this.totalWorkers = totalWorkers;
        this.roundIndex = roundIndex;
        this.roundArguments = roundArguments;
        this.sutAdapter = sutAdapter;
        this.sutContext = sutContext;
    }

    async submitTransaction() {
        this.txIndex++;
        let assets = this.roundArguments.assets;
        let promises = [];
        while(assets >=0) {
            let carNumber = 'Client' + this.workerIndex + '_CAR' + assets.toString();
            let carColor = colors[Math.floor(Math.random() * colors.length)];
            let carMake = makes[Math.floor(Math.random() * makes.length)];
            let carModel = models[Math.floor(Math.random() * models.length)];
            let carOwner = owners[Math.floor(Math.random() * owners.length)];

            let args = {
                contractId: 'fabcar',
                contractVersion: 'v1',
                contractFunction: 'createCar',
                contractArguments: [carNumber, carMake, carModel, carColor, carOwner],
                timeout: 30
            };

            promises.push(this.sutAdapter.sendRequests(args));
            assets--;
        } 
        await Promise.all(promises);
    }

    async cleanupWorkloadModule() {
        // NOOP
    }
}

function createWorkloadModule() {
    return new InitCarLedgerWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;

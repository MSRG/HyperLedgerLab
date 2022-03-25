const { WorkloadModuleInterface  } = require('@hyperledger/caliper-core');

const changeCarOwner = require('./changeCarOwner')
const createCar = require('./createCar')
const queryCar = require('./queryCar')
const queryAllCars = require('./queryAllCars')

const logger = require('@hyperledger/caliper-core').CaliperUtils.getLogger('randomtx-module');

class RandomTxWorkload extends WorkloadModuleInterface {
    constructor() {
        super();
        logger.debug(`===CHANGE OWNER IS=== ${changeCarOwner}`);
        this.changeCarOwner = changeCarOwner.createWorkloadModule();
        this.createCar = createCar.createWorkloadModule();
        this.queryCar = queryCar.createWorkloadModule();
        this.queryAllCars = queryAllCars.createWorkloadModule();
    }
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        let initializations = [
            this.changeCarOwner.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext),
            this.createCar.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext),
            this.queryCar.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext),
            this.queryAllCars.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext)
        ]
        await Promise.all(initializations);
    }
    async submitTransaction() {
        const randoSeed = Math.floor(Math.random() * Math.floor(4))
        let tx
        switch (randoSeed) {
            case 0:
                tx = this.changeCarOwner
                break
            case 1:
                tx = this.createCar
                break
            case 2:
                tx = this.queryCar
                break
            case 3:
                tx = this.queryAllCars
                break
            default:
                logger.debug('===RANDOM ERROR HAPPENED===')
                break
        }
        return tx.submitTransaction()
    }
    async cleanupWorkloadModule() {
        // NOOP
    }
}

function createWorkloadModule() {
    return new RandomTxWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;

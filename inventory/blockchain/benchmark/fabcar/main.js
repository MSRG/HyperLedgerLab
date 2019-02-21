'use strict';

const Util = require('../../../../caliper/src/comm/util');

let configFile;
let networkFile;

/**
 * Set benchmark config file
 * @param {*} file config file of the benchmark,  default is config.json
 */
function setConfig(file) {
    configFile = file;
}

/**
 * Set benchmark network file
 * @param {*} file config file of the blockchain system, eg: fabric.json
 */
function setNetwork(file) {
    networkFile = file;
}

/**
 * Entry point of the Benchmarking script.
 */
function main() {
    let program = require('commander');
    program.version('0.1')
        .option('-c, --config <file>', 'config file of the benchmark, default is config.json', setConfig)
        .option('-n, --network <file>', 'config file of the blockchain system under test, if not provided, blockchain property in benchmark config is used', setNetwork)
        .parse(process.argv);

    const path = require('path');
    const fs = require('fs-extra');
    let logger = Util.getLogger('benchmark/fabcar/main.js');
    let absConfigFile;
    if(typeof configFile === 'undefined') {
        absConfigFile = path.join(__dirname, 'config.yaml');
    }
    else {
        absConfigFile = path.isAbsolute(configFile) ? configFile : path.join(__dirname, configFile);
    }
    if(!fs.existsSync(absConfigFile)) {
        logger.error('file ' + absConfigFile + ' does not exist');
        return;
    }

    let absNetworkFile;
    let absCaliperDir = path.join(__dirname, '../..');
    if(typeof networkFile === 'undefined') {
        try{
            absNetworkFile = path.join(absCaliperDir, 'fabric_network.json');
        }
        catch(err) {
            logger.error('failed to find blockchain.config in ' + absConfigFile);
            return;
        }
    }
    else {
        absNetworkFile = path.isAbsolute(networkFile) ? networkFile : path.join(__dirname, networkFile);
    }
    if(!fs.existsSync(absNetworkFile)) {
        logger.error('file ' + absNetworkFile + ' does not exist');
        return;
    }


    const framework = require('../../../../caliper/src/comm/bench-flow.js');
    (async () => {
        try {
            await framework.run(absConfigFile, absNetworkFile);
        } catch (err) {
            logger.error(`Error while executing the benchmark: ${err.stack ? err.stack : err}`);
        }
    })();
}

main();

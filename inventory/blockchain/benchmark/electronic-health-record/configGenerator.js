'use strict';

const fs = require('fs');
const read = require('read-yaml');
const KnuthShuffle = require('./knuthShuffle');
const random = require('./random');

const parameters = read.sync('parameters.yaml');

// provide file name here
const INIT = 'initLedger.js';

// provide directory for test cases
const BENCHMARKDIR = '../inventory/blockchain/benchmark/electronic-health-record/';

// PROVIDE SOURCE FILES
const ALLTESTCASE = [
    'addEhr',
    'getAllEHRforActor',
    'grantEhrAccess',
    'grantProfileAccess',
    'readProfile',
    'revokeEhrAccess',
    'revokeProfileAccess',
    'viewPartialProfile',
    'queryEhr'
];

// PROVIDE NUMBER OF TESTCASES
let testCasePermuation = [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8
];

let permutationsToCompute = parameters.permutationsToCompute !== undefined ? parameters.permutationsToCompute : 1;

let config =
`---
test:
  clients:
    type: local
    number: 10

  rounds:
  - label: initLedger
    txNumber:
    - 1
    rateControl:
    - type: fixed-rate
      opts:
        tps: 1
    callback: ${BENCHMARKDIR + INIT}`;

// add the full testcase suite for a specified number of times
for (let i = 0; i < permutationsToCompute; i++) {
    // shuffle on each new run
    testCasePermuation = KnuthShuffle.shuffle(testCasePermuation);

    console.info(`shuffling: ${testCasePermuation}`);

    // add each testcase
    for (let j = 0; j < ALLTESTCASE.length; j++) {
        config +=
      `

  - label: ${ALLTESTCASE[testCasePermuation[j]]}
    txNumber:
    - 1000
    - 1000
    rateControl:
    - type: fixed-rate
      opts:
        tps: ${random.standardNormalNatural(parameters.tpsMax, parameters.tpsDeviation)}
    - type: fixed-rate
      opts:
        tps: ${random.standardNormalNatural(parameters.tpsMax, parameters.tpsDeviation)}
    callback: ${BENCHMARKDIR + ALLTESTCASE[testCasePermuation[j]]}.js`;
    }
}

config +=
      `
  - label: readBlockchain
    txNumber:
    - 1
    rateControl:
    - type: fixed-rate
      opts:
        tps: 1
    callback: ${BENCHMARKDIR}queryEhr.js`;

config += `

monitor:
  type:
  - process
  process:
  - command: node
    arguments: local-client.js
    multiOutput: avg
  interval: 1`;

fs.writeFile('config.yaml', config, function(err) {
    if (err) {
        console.log(err);
    }
});

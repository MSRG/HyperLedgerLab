'use strict';

const rand = require('./random');
const seeds = require('./generatedSeeds');

let standardDerivation = rand.randomZeroToTen();
let randomAccessKey = rand.randomIndex(seeds.allSSCC.length, standardDerivation);
let ssccKey = seeds.allSSCC[randomAccessKey].toString();

//console.info(ssccKey);

randomAccessKey = rand.randomIndex(seeds.allLsp.length, standardDerivation);
let lspName = seeds.allLsp[randomAccessKey].name;
//console.info(lspName);

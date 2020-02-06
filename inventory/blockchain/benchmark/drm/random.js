'use strict';

const unirand = require('unirand');
const getParameters = require('./getParameters');
var zipfian  = require("zipfian-integer")
var deck = require('deck');
var Picker = require('random-picker').Picker;
let hotKeyProb = getParameters.hotKeyProb();
var picker = new Picker();
picker.option(0, hotKeyProb);
picker.option(1, 100 - hotKeyProb);

class Random {

    /*static randomIndex(sizeKeyspace, derivation) {
	console.info('sizeKeyspace: ')
	console.info(sizeKeyspace)
        let mu = (sizeKeyspace -1) / 2;
	console.info('mu: ')
	console.info(mu)
	let stdDev = mu;
	if (derivation == 0) {
		stdDev = sizeKeyspace/getParameters.keySpaceStdDev();
		console.info('stdDev1: ')
        	console.info(stdDev)
	}
	else if (derivation == 1) {
		stdDev = getParameters.blocksizeStdDev();
		console.info('stdDev2: ')
                console.info(stdDev)
	}
        if (stdDev > mu) {
		stdDev = mu;
		console.info('stdDev3: ')
                console.info(stdDev)
	}
        let rounded = -5.5;
	console.info('stdDevOut: ')
        console.info(stdDev)
        // rounded shold be in [0, sizeKeyspace)
        while (rounded < 0 || sizeKeyspace < rounded ) {
            let random = unirand.normal(mu, stdDev).randomSync();
            rounded = Math.round(random);
        }
        return rounded;
    }*/
    static randomIndex(sizeKeyspace, keyPickerType) {
	//let hotKeyProb = getParameters.hotKeyProb();
        //var picker = new Picker();
        //picker.option(0, hotKeyProb);
        //picker.option(1, 100 - hotKeyProb);
	if (keyPickerType == 0) {
		let skew = getParameters.zipfianSkew();
		const index = zipfian(1, sizeKeyspace-1, skew);
		//console.info('RANDOMINDEX: ', index());
		return index();
	}
	else if (keyPickerType == 1) {
		let hotKeyNumPer = getParameters.hotKeyNum();
		let hotKeyNum = Math.round((hotKeyNumPer/100)*sizeKeyspace) 
		//console.info('hotKeyNumPer', hotKeyNumPer);
		//console.info('hotKeyNum', hotKeyNum);
		//console.info('sizeKeyspace', sizeKeyspace);
		//let hotKeyProb = getParameters.hotKeyProb();
		//var picker = new Picker();
    		//picker.option(0, hotKeyProb);
    		//picker.option(1, 100 - hotKeyProb);
		if (picker.pick() == 0) {
			const index = zipfian(1, hotKeyNum, 0);
                //	console.info('RANDOMINDEX: ', index());
                //	console.info('PICKED0');
			return index();
		}
		else if (picker.pick() == 1) {
                        const index = zipfian(hotKeyNum+1, sizeKeyspace-1, 0);
			//console.info('RANDOMINDEX: ', index());
			//console.info('PICKED1');
                        return index();
                }

        }

    }
    static randomZeroToTen() {
        // uniformly distributed on domain [0,1)
        return unirand.random() * 10;
    }

    static uniformNatural(upper) {
        return Math.ceil(unirand.random() * upper);
    }

    static standardNormalNatural(upper, deviation) {
        let mu = upper / 2;
        let random = unirand.normal(mu, deviation).randomSync();
        return Math.round(random);
    }
}

module.exports = Random;

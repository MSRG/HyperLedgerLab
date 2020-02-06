'use strict';
class getParameters {

    static keyPickerType() {
	//keyPickerType values: 0==zipfian, 1==hotkey 
        let keyPickerType = 0;
	return keyPickerType;
   }
   static zipfianSkew() {
        //zipfianSkew values: 0==uniform, Negative==HigherValues, Positive==LowerValues
        let zipfianSkew = 1;
        return zipfianSkew;
   }
   static hotKeyProb() {
        let hotKeyProb = 90;
        return hotKeyProb;
   }
   static hotKeyNum() {
        let hotKeyNum = 50;
        return hotKeyNum;
   }

    static chaincodeType() {
	//chaincodeType values: 0==Uniform, 1==ReadHeavy, 2==WriteHeavy
        let chaincodeType = 0;
        return chaincodeType;
   }
   static readWriteProb() {
        let readWriteProb = 50;
        return readWriteProb;
   }


}

module.exports = getParameters;


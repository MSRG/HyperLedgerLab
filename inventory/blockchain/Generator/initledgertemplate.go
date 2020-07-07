func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
                const sizeKeySpace = 100000
                const dataType = 1 // 0: Numeral 1: Json String
                const constantMultiplier = 100
                if dataType == 0 {
                        for key := 1; key <= sizeKeySpace; key++ {
                                value := key * constantMultiplier
                                APIstub.PutState(key, value)
                        }
                }
                if dataType == 1 {
                        for i := 1; i <= sizeKeySpace; i++ {
                            val := "{\"Parameter1\":\"random string\", \"Parameter2\":1050, \"Parameter3\":\"new string\", \"Parameter4\":\"another string\", \"Parameter5\":false}"
                            APIstub.PutState(i, val)
                        }
                }
        return shim.Success(nil)
}


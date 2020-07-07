package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the ledger appropriately
	if function == "initLedger" {
		return s.initLedger(APIstub, args)
	} else if function == "func" {
		return s.read1(APIstub, args)
	} 
	return shim.Error("Invalid Smart Contract function name.")
}
//initLedger arg[0] is number of keys and arg[1]
func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
		for key := 1; key <= args[0]; key++ {
			value := args[1] * 235
			APIstub.PutState(key, value)
		}
	return shim.Success(nil)
}


func (s *SmartContract) func(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	value, _ := APIstub.GetState(args[0])
	APIstub.PutState(args[0], value)
	//return shim.Success(value)
	return shim.Success(nil)
}



// The main function is only relevant in unit test mode. Only included here for completeness.
func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}


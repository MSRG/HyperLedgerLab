package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct {
}

type genstruct struct {
	ObjectType string `json:"docType"` //docType is used to distinguish the various types of objects in state database
	ParameterA       string `json:"parametera"`    //the fieldtags are needed to keep case from bouncing around
	ParameterB      string `json:"parameterb"`
	ParameterC       int    `json:"parameterc"`
	ParameterD      string `json:"parameterd"`
}

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}
func (s *SmartContract) doNothing(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}
func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the ledger appropriately
	if function == "initLedger" {
		return s.initLedger(APIstub, args)
	} else if function == "doNothing" {
		return s.doNothing(APIstub)
	} else if function == "func1" {
		return s.func1(APIstub, args)
	} else if function == "func2" {
		return s.func2(APIstub, args)
	} else if function == "func3" {
		return s.func3(APIstub, args)
	} else if function == "func4" {
		return s.func4(APIstub, args)
	} else if function == "func5" {
		return s.func5(APIstub, args)
	} else if function == "func6" {
		return s.func6(APIstub, args)
	} else if function == "func7" {
		return s.func7(APIstub, args)
	} else if function == "func8" {
		return s.func8(APIstub, args)
	} else if function == "func9" {
		return s.func9(APIstub, args)
	} else if function == "func10" {
		return s.func10(APIstub, args)
	} else if function == "func11" {
		return s.func11(APIstub, args)
	} else if function == "func12" {
		return s.func12(APIstub, args)
	} else if function == "func13" {
		return s.func13(APIstub, args)
	} else if function == "func14" {
		return s.func14(APIstub, args)
	} else if function == "func15" {
		return s.func15(APIstub, args)
	} else if function == "func16" {
		return s.func16(APIstub, args)
	} else if function == "func17" {
		return s.func17(APIstub, args)
	} else if function == "func18" {
		return s.func18(APIstub, args)
	} 
	return shim.Error("Invalid Smart Contract function name.")
}
//initLedger arg[0] is the key and arg[1] is the value
func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	jvalue, _ := json.Marshal(args[1])
	APIstub.PutState(args[0], jvalue)

	return shim.Success(nil)
}
func (s *SmartContract) func1(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

 //Read key
  value, _ := APIstub.GetState(args[0])
 //Read key
  value, _ = APIstub.GetState(args[1])
  _ = value
   fmt.Println(value)

	return shim.Success(nil)
}
func (s *SmartContract) func2(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

 //Read key
  value, _ := APIstub.GetState(args[0])
 //Read key
  value, _ = APIstub.GetState(args[1])
 //Read key
  value, _ = APIstub.GetState(args[2])
 //Read key
  value, _ = APIstub.GetState(args[3])
  _ = value
   fmt.Println(value)

	return shim.Success(nil)
}
func (s *SmartContract) func3(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

 //Read key
  value, _ := APIstub.GetState(args[0])
 //Read key
  value, _ = APIstub.GetState(args[1])
 //Read key
  value, _ = APIstub.GetState(args[2])
 //Read key
  value, _ = APIstub.GetState(args[3])
 //Read key
  value, _ = APIstub.GetState(args[4])
 //Read key
  value, _ = APIstub.GetState(args[5])
 //Read key
  value, _ = APIstub.GetState(args[6])
 //Read key
  value, _ = APIstub.GetState(args[7])
  _ = value
   fmt.Println(value)

	return shim.Success(nil)
}
func (s *SmartContract) func4(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

 //Insert new key
  jvalue, _ := json.Marshal(args[1])
  APIstub.PutState(args[0], jvalue)
 //Insert new key
  jvalue, _ = json.Marshal(args[3])
  APIstub.PutState(args[2], jvalue)

	return shim.Success(nil)
}
func (s *SmartContract) func5(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

 //Insert new key
  jvalue, _ := json.Marshal(args[1])
  APIstub.PutState(args[0], jvalue)
 //Insert new key
  jvalue, _ = json.Marshal(args[3])
  APIstub.PutState(args[2], jvalue)
 //Insert new key
  jvalue, _ = json.Marshal(args[5])
  APIstub.PutState(args[4], jvalue)
 //Insert new key
  jvalue, _ = json.Marshal(args[7])
  APIstub.PutState(args[6], jvalue)

	return shim.Success(nil)
}
func (s *SmartContract) func6(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

 //Insert new key
  jvalue, _ := json.Marshal(args[1])
  APIstub.PutState(args[0], jvalue)
 //Insert new key
  jvalue, _ = json.Marshal(args[3])
  APIstub.PutState(args[2], jvalue)
 //Insert new key
  jvalue, _ = json.Marshal(args[5])
  APIstub.PutState(args[4], jvalue)
 //Insert new key
  jvalue, _ = json.Marshal(args[7])
  APIstub.PutState(args[6], jvalue)
 //Insert new key
  jvalue, _ = json.Marshal(args[9])
  APIstub.PutState(args[8], jvalue)
 //Insert new key
  jvalue, _ = json.Marshal(args[11])
  APIstub.PutState(args[10], jvalue)
 //Insert new key
  jvalue, _ = json.Marshal(args[13])
  APIstub.PutState(args[12], jvalue)
 //Insert new key
  jvalue, _ = json.Marshal(args[15])
  APIstub.PutState(args[14], jvalue)

	return shim.Success(nil)
}
func (s *SmartContract) func7(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

 //Update a key
  value, _ := APIstub.GetState(args[0])
   newgen := genstruct{}
   json.Unmarshal(value, &newgen)
   newgen.ParameterB = args[1]
   jvalue, _ := json.Marshal(newgen)

  APIstub.PutState(args[0], jvalue)
 //Update a key
  value, _ = APIstub.GetState(args[2])
   newgen = genstruct{}
   json.Unmarshal(value, &newgen)
   newgen.ParameterB = args[3]
   jvalue, _ = json.Marshal(newgen)

  APIstub.PutState(args[2], jvalue)
  _ = value
   fmt.Println(value)

	return shim.Success(nil)
}
func (s *SmartContract) func8(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

 //Update a key
  value, _ := APIstub.GetState(args[0])
   newgen := genstruct{}
   json.Unmarshal(value, &newgen)
   newgen.ParameterB = args[1]
   jvalue, _ := json.Marshal(newgen)

  APIstub.PutState(args[0], jvalue)
 //Update a key
  value, _ = APIstub.GetState(args[2])
   newgen = genstruct{}
   json.Unmarshal(value, &newgen)
   newgen.ParameterB = args[3]
   jvalue, _ = json.Marshal(newgen)

  APIstub.PutState(args[2], jvalue)
 //Update a key
  value, _ = APIstub.GetState(args[4])
   newgen = genstruct{}
   json.Unmarshal(value, &newgen)
   newgen.ParameterB = args[5]
   jvalue, _ = json.Marshal(newgen)

  APIstub.PutState(args[4], jvalue)
 //Update a key
  value, _ = APIstub.GetState(args[6])
   newgen = genstruct{}
   json.Unmarshal(value, &newgen)
   newgen.ParameterB = args[7]
   jvalue, _ = json.Marshal(newgen)

  APIstub.PutState(args[6], jvalue)
  _ = value
   fmt.Println(value)

	return shim.Success(nil)
}
func (s *SmartContract) func9(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

 //Update a key
  value, _ := APIstub.GetState(args[0])
   newgen := genstruct{}
   json.Unmarshal(value, &newgen)
   newgen.ParameterB = args[1]
   jvalue, _ := json.Marshal(newgen)

  APIstub.PutState(args[0], jvalue)
 //Update a key
  value, _ = APIstub.GetState(args[2])
   newgen = genstruct{}
   json.Unmarshal(value, &newgen)
   newgen.ParameterB = args[3]
   jvalue, _ = json.Marshal(newgen)

  APIstub.PutState(args[2], jvalue)
 //Update a key
  value, _ = APIstub.GetState(args[4])
   newgen = genstruct{}
   json.Unmarshal(value, &newgen)
   newgen.ParameterB = args[5]
   jvalue, _ = json.Marshal(newgen)

  APIstub.PutState(args[4], jvalue)
 //Update a key
  value, _ = APIstub.GetState(args[6])
   newgen = genstruct{}
   json.Unmarshal(value, &newgen)
   newgen.ParameterB = args[7]
   jvalue, _ = json.Marshal(newgen)

  APIstub.PutState(args[6], jvalue)
 //Update a key
  value, _ = APIstub.GetState(args[8])
   newgen = genstruct{}
   json.Unmarshal(value, &newgen)
   newgen.ParameterB = args[9]
   jvalue, _ = json.Marshal(newgen)

  APIstub.PutState(args[8], jvalue)
 //Update a key
  value, _ = APIstub.GetState(args[10])
   newgen = genstruct{}
   json.Unmarshal(value, &newgen)
   newgen.ParameterB = args[11]
   jvalue, _ = json.Marshal(newgen)

  APIstub.PutState(args[10], jvalue)
 //Update a key
  value, _ = APIstub.GetState(args[12])
   newgen = genstruct{}
   json.Unmarshal(value, &newgen)
   newgen.ParameterB = args[13]
   jvalue, _ = json.Marshal(newgen)

  APIstub.PutState(args[12], jvalue)
 //Update a key
  value, _ = APIstub.GetState(args[14])
   newgen = genstruct{}
   json.Unmarshal(value, &newgen)
   newgen.ParameterB = args[15]
   jvalue, _ = json.Marshal(newgen)

  APIstub.PutState(args[14], jvalue)
  _ = value
   fmt.Println(value)

	return shim.Success(nil)
}
func (s *SmartContract) func10(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

 //Delete a key
  APIstub.DelState(args[0])
 //Delete a key
  APIstub.DelState(args[1])

	return shim.Success(nil)
}
func (s *SmartContract) func11(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

 //Delete a key
  APIstub.DelState(args[0])
 //Delete a key
  APIstub.DelState(args[1])
 //Delete a key
  APIstub.DelState(args[2])
 //Delete a key
  APIstub.DelState(args[3])

	return shim.Success(nil)
}
func (s *SmartContract) func12(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

 //Delete a key
  APIstub.DelState(args[0])
 //Delete a key
  APIstub.DelState(args[1])
 //Delete a key
  APIstub.DelState(args[2])
 //Delete a key
  APIstub.DelState(args[3])
 //Delete a key
  APIstub.DelState(args[4])
 //Delete a key
  APIstub.DelState(args[5])
 //Delete a key
  APIstub.DelState(args[6])
 //Delete a key
  APIstub.DelState(args[7])

	return shim.Success(nil)
}
func (s *SmartContract) func13(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

 //Get range of keys
  value, _ := APIstub.GetStateByRange(args[0], args[1])
 //Get range of keys
  value, _ = APIstub.GetStateByRange(args[2], args[3])
  _ = value
   fmt.Println(value)

	return shim.Success(nil)
}
func (s *SmartContract) func14(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

 //Get range of keys
  value, _ := APIstub.GetStateByRange(args[0], args[1])
 //Get range of keys
  value, _ = APIstub.GetStateByRange(args[2], args[3])
 //Get range of keys
  value, _ = APIstub.GetStateByRange(args[4], args[5])
 //Get range of keys
  value, _ = APIstub.GetStateByRange(args[6], args[7])
  _ = value
   fmt.Println(value)

	return shim.Success(nil)
}
func (s *SmartContract) func15(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

 //Get range of keys
  value, _ := APIstub.GetStateByRange(args[0], args[1])
 //Get range of keys
  value, _ = APIstub.GetStateByRange(args[2], args[3])
 //Get range of keys
  value, _ = APIstub.GetStateByRange(args[4], args[5])
 //Get range of keys
  value, _ = APIstub.GetStateByRange(args[6], args[7])
 //Get range of keys
  value, _ = APIstub.GetStateByRange(args[8], args[9])
 //Get range of keys
  value, _ = APIstub.GetStateByRange(args[10], args[11])
 //Get range of keys
  value, _ = APIstub.GetStateByRange(args[12], args[13])
 //Get range of keys
  value, _ = APIstub.GetStateByRange(args[14], args[15])
  _ = value
   fmt.Println(value)

	return shim.Success(nil)
}
func (s *SmartContract) func16(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

 //Query using query string
  value, _ := APIstub.GetQueryResult(args[0])
 //Query using query string
  value, _ = APIstub.GetQueryResult(args[1])
  _ = value
   fmt.Println(value)

	return shim.Success(nil)
}
func (s *SmartContract) func17(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

 //Query using query string
  value, _ := APIstub.GetQueryResult(args[0])
 //Query using query string
  value, _ = APIstub.GetQueryResult(args[1])
 //Query using query string
  value, _ = APIstub.GetQueryResult(args[2])
 //Query using query string
  value, _ = APIstub.GetQueryResult(args[3])
  _ = value
   fmt.Println(value)

	return shim.Success(nil)
}
func (s *SmartContract) func18(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

 //Query using query string
  value, _ := APIstub.GetQueryResult(args[0])
 //Query using query string
  value, _ = APIstub.GetQueryResult(args[1])
 //Query using query string
  value, _ = APIstub.GetQueryResult(args[2])
 //Query using query string
  value, _ = APIstub.GetQueryResult(args[3])
 //Query using query string
  value, _ = APIstub.GetQueryResult(args[4])
 //Query using query string
  value, _ = APIstub.GetQueryResult(args[5])
 //Query using query string
  value, _ = APIstub.GetQueryResult(args[6])
 //Query using query string
  value, _ = APIstub.GetQueryResult(args[7])
  _ = value
   fmt.Println(value)

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

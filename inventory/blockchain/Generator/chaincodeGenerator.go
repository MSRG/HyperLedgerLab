package main

import (
	"bufio"
	"io"
	"os"
	"strconv"
)

func check(e error) {
	if e != nil {
		panic(e)
	}
}

//source: https://stackoverflow.com/questions/30693421/how-to-read-specific-line-of-file
func ReadLine(r io.Reader, lineNum int) (line string, lastLine int, err error) {
	sc := bufio.NewScanner(r)
	for sc.Scan() {
		lastLine++
		if lastLine == lineNum {
			// you can return sc.Bytes() if you need output in []bytes
			return sc.Text(), lastLine, sc.Err()
		}
	}
	return line, lastLine, io.EOF
}
func main() {
	//Input parameters
	const nfuncs = 18
	const noperations = 7
	/*
		Read: 1 argument -- Key
		Insert: 2 arguments -- Key and value
		Update: 2 arguments -- Key and multiplier (Multiplies the current value of key with multiplier)
		Delete: 1 argument -- Key
		Range: 2 arguments -- Start key and end key
		Donothing: 1 argument -- Nil value (Just to make uniform function format)
		Couchdb Query: 1 argument -- Query string in couch db format
	*/

	//7 + 1 => {type of function, read, insert, update, delete, range, donothing, couchdbquery} in each function
	//type of function : 0 readonly, 1 insertonly, 2 updateonly, 3 deleteonly, 4 rangeonly, 5 donothingonly, 6 couchdbqueryonly, 7 mixed
	//funcdef := [nfuncs][noperations + 1]int{{7, 5, 1, 1, 1, 1, 1, 1}, {1, 0, 2, 0, 0, 0, 0, 1}, {2, 0, 0, 2, 0, 0, 0, 0}, {3, 0, 0, 0, 2, 0, 0, 0}}
	//funcdef := [nfuncs][noperations + 1]int{{0, 2, 0, 0, 0, 0, 0, 0}, {0, 4, 0, 0, 0, 0, 0, 0}, {0, 8, 0, 0, 0, 0, 0, 0}, {1, 0, 2, 0, 0, 0, 0, 0}, {1, 0, 4, 0, 0, 0, 0, 0}, {1, 0, 8, 0, 0, 0, 0, 0}, {2, 0, 0, 2, 0, 0, 0, 0}, {2, 0, 0, 4, 0, 0, 0, 0}, {2, 0, 0, 8, 0, 0, 0, 0}, {3, 0, 0, 0, 2, 0, 0, 0}, {3, 0, 0, 0, 4, 0, 0, 0}, {3, 0, 0, 0, 8, 0, 0, 0}, {4, 0, 0, 0, 0, 2, 0, 0}, {4, 0, 0, 0, 0, 4, 0, 0}, {4, 0, 0, 0, 0, 8, 0, 0}, {6, 0, 0, 0, 0, 0, 0, 2}, {6, 0, 0, 0, 0, 0, 0, 4}, {6, 0, 0, 0, 0, 0, 0, 8}}
	funcdef := [nfuncs][noperations + 1]int{{0, 2, 0, 0, 0, 0, 0, 0}, {0, 4, 0, 0, 0, 0, 0, 0}, {0, 8, 0, 0, 0, 0, 0, 0}, {1, 0, 2, 0, 0, 0, 0, 0}, {1, 0, 4, 0, 0, 0, 0, 0}, {1, 0, 8, 0, 0, 0, 0, 0}, {2, 0, 0, 2, 0, 0, 0, 0}, {2, 0, 0, 4, 0, 0, 0, 0}, {2, 0, 0, 8, 0, 0, 0, 0}, {3, 0, 0, 0, 2, 0, 0, 0}, {3, 0, 0, 0, 4, 0, 0, 0}, {3, 0, 0, 0, 8, 0, 0, 0}, {4, 0, 0, 0, 0, 2, 0, 0}, {4, 0, 0, 0, 0, 4, 0, 0}, {4, 0, 0, 0, 0, 8, 0, 0}, {6, 0, 0, 0, 0, 0, 0, 2}, {6, 0, 0, 0, 0, 0, 0, 4}, {6, 0, 0, 0, 0, 0, 0, 8}}
	//Read from a chaincode template
	fread, err := os.Open("./chaincodetemplate.go")
	check(err)
	r := bufio.NewReader(fread)

	//Read from a ifelse template
	freadifelse, err := os.Open("./ifelsetemplate.go")
	check(err)
	rifelse := bufio.NewReader(freadifelse)

	//Read from a func template
	freadfunc, err := os.Open("./functemplate.txt")
	check(err)
	rfunc := bufio.NewReader(freadfunc)

	//Create output file generatedchaincode.go
	fwrite, err := os.Create("./generatedchaincode.go")
	check(err)
	defer fwrite.Close()
	w := bufio.NewWriter(fwrite)

	//Write specific template code lines to generatedchaincode.go

	//Write header and init function
	for i := 1; i <= 19; i++ {
		line, _, _ := ReadLine(r, i)
		w.WriteString(line)
		w.WriteString("\n")
		fread.Seek(0, io.SeekStart)
	}

	//Write invoke function
	for i := 20; i <= 28; i++ {
		line, _, _ := ReadLine(r, i)
		w.WriteString(line)
		w.WriteString("\n")
		fread.Seek(0, io.SeekStart)
	}

	for i := 1; i <= nfuncs*2; i++ {
		line, _, _ := ReadLine(rifelse, i)
		w.WriteString(line)
		w.WriteString("\n")
		freadifelse.Seek(0, io.SeekStart)
	}

	for i := 31; i <= 33; i++ {
		line, _, _ := ReadLine(r, i)
		w.WriteString(line)
		w.WriteString("\n")
		fread.Seek(0, io.SeekStart)
	}

	//Write initLedger function
	for i := 34; i <= 41; i++ {
		line, _, _ := ReadLine(r, i)
		w.WriteString(line)
		w.WriteString("\n")
		fread.Seek(0, io.SeekStart)
	}

	//Write function
	var valExists = 0
	for funci := 0; funci < nfuncs; funci++ {

		line, _, _ := ReadLine(rfunc, funci+1)
		w.WriteString(line)
		w.WriteString("\n")
		w.WriteString("\n")
		freadfunc.Seek(0, io.SeekStart)
		countargs := 0

		for i := 1; i <= noperations; i++ {

			num := funcdef[funci][i] //number of read, insert, update, delete, range, donothing
			//read
			if i == 1 {

				for n := 0; n < num; n++ {
					valExists = 1
					commstring := "	//Read key"
					w.WriteString(commstring)
					w.WriteString("\n")

					if n == 0 {
						getstring := "	value, _ := APIstub.GetState(args[" + strconv.Itoa(n) + "])"
						w.WriteString(getstring)

					} else {
						getstring := "	value, _ = APIstub.GetState(args[" + strconv.Itoa(n) + "])"
						w.WriteString(getstring)

					}
					w.WriteString("\n")

				}

			}

			//insert
			if i == 2 {
				currentcount := countargs
				for n := 0; n < num; n++ {
					commstring := "	//Insert new key"
					w.WriteString(commstring)
					w.WriteString("\n")
					if n == 0 {
						getstring := "	jvalue, _ := json.Marshal(args[" + strconv.Itoa(currentcount+1) + "])"
						w.WriteString(getstring)

					} else {
						getstring := "	jvalue, _ = json.Marshal(args[" + strconv.Itoa(currentcount+1) + "])"
						w.WriteString(getstring)

					}
					w.WriteString("\n")
					getstring := "	APIstub.PutState(args[" + strconv.Itoa(currentcount) + "], jvalue)"
					w.WriteString(getstring)
					w.WriteString("\n")
					currentcount = currentcount + 2
				}
				num = num * 2
			}
			//update
			if i == 3 {
				currentcount := countargs
				for n := 0; n < num; n++ {
					valExists = 1
					commstring := "	//Update a key"
					w.WriteString(commstring)
					w.WriteString("\n")

					if n == 0 {
						getstring := "	value, _ := APIstub.GetState(args[" + strconv.Itoa(currentcount) + "])"
						w.WriteString(getstring)
						w.WriteString("\n")
						getstring = "	valuex := args[" + strconv.Itoa(currentcount+1) + "]"
						w.WriteString(getstring)
						w.WriteString("\n")
						getstring = "	jvalue, _ := json.Marshal(valuex)"
						w.WriteString(getstring)
						w.WriteString("\n")

					} else {
						getstring := "	value, _ = APIstub.GetState(args[" + strconv.Itoa(currentcount) + "])"
						w.WriteString(getstring)
						w.WriteString("\n")
						getstring = "	valuex = args[" + strconv.Itoa(currentcount+1) + "]"
						w.WriteString(getstring)
						w.WriteString("\n")
						getstring = "	jvalue, _ = json.Marshal(valuex)"
						w.WriteString(getstring)
						w.WriteString("\n")

					}
					w.WriteString("\n")
					getstring := "	APIstub.PutState(args[" + strconv.Itoa(currentcount) + "], " + "jvalue)"
					w.WriteString(getstring)
					w.WriteString("\n")
					currentcount = currentcount + 2
				}

			}
			//delete
			if i == 4 {
				currentcount := countargs
				for n := 0; n < num; n++ {
					commstring := "	//Delete a key"
					w.WriteString(commstring)
					w.WriteString("\n")
					getstring := "	APIstub.DelState(args[" + strconv.Itoa(currentcount) + "])"
					w.WriteString(getstring)
					w.WriteString("\n")
					currentcount = currentcount + 1

				}
			}
			//range
			if i == 5 {
				currentcount := countargs
				for n := 0; n < num; n++ {
					valExists = 1
					commstring := "	//Get range of keys"
					w.WriteString(commstring)
					w.WriteString("\n")
					if n == 0 {
						getstring := "	value, _ := APIstub.GetStateByRange(args[" + strconv.Itoa(currentcount) + "], " + "args[" + strconv.Itoa(currentcount+1) + "])"
						w.WriteString(getstring)
					} else {
						getstring := "	value, _ = APIstub.GetStateByRange(args[" + strconv.Itoa(currentcount) + "], " + "args[" + strconv.Itoa(currentcount+1) + "])"
						w.WriteString(getstring)

					}
					w.WriteString("\n")
					currentcount = currentcount + 2
				}

			}
			//donothing
			if i == 6 {
				for n := 0; n < num; n++ {

				}
			}
			//CouchDB Queries
			if i == 7 {
				currentcount := countargs
				for n := 0; n < num; n++ {
					valExists = 1
					commstring := "	//Query using query string"
					w.WriteString(commstring)
					w.WriteString("\n")
					if n == 0 {
						getstring := "	value, _ := APIstub.GetQueryResult(args[" + strconv.Itoa(currentcount) + "])"
						w.WriteString(getstring)

					} else {
						getstring := "	value, _ = APIstub.GetQueryResult(args[" + strconv.Itoa(currentcount) + "])"
						w.WriteString(getstring)

					}
					w.WriteString("\n")
					currentcount = currentcount + 1

				}

			}

			countargs = countargs + num
		}
		if valExists == 1 {
			getstring := "	_ = value"
			w.WriteString(getstring)
			w.WriteString("\n")
			valExists = 0
			getstring = "	fmt.Println(value)"
			w.WriteString(getstring)
			w.WriteString("\n")
		}
		line, _, _ = ReadLine(r, 50)
		w.WriteString("\n")
		w.WriteString(line)
		w.WriteString("\n")
		fread.Seek(0, io.SeekStart)
		line, _, _ = ReadLine(r, 51)
		w.WriteString(line)
		w.WriteString("\n")
		fread.Seek(0, io.SeekStart)

	}

	//Write main function
	for i := 55; i <= 63; i++ {
		line, _, _ := ReadLine(r, i)
		w.WriteString(line)
		w.WriteString("\n")
		fread.Seek(0, io.SeekStart)
	}

	// line, _, err := ReadLine(r, 25)
	// w.WriteString(line)
	// w.WriteString("\n")
	// line, _, err := ReadLine(r, 31)
	// w.WriteString(line)
	// w.WriteString("\n")

	w.Flush()
	fread.Close()
	fwrite.Close()

	// d1 := []byte("hello\ngo\n")
	// err := ioutil.WriteFile("./generatedchaincode.go", d1, 0644)
	// check(err)

	// f, err := os.Create("./generatedchaincode1.go")
	// check(err)

	// defer f.Close()

	// d2 := []byte{115, 111, 109, 101, 10}
	// n2, err := f.Write(d2)
	// check(err)
	// fmt.Printf("wrote %d bytes\n", n2)

	// n3, err := f.WriteString("writes\n")
	// check(err)
	// fmt.Printf("wrote %d bytes\n", n3)

	// f.Sync()

	// w := bufio.NewWriter(f)
	// n4, err := w.WriteString("buffered\n")
	// check(err)
	// fmt.Printf("wrote %d bytes\n", n4)

	// w.Flush()

	// dat, err := ioutil.ReadFile("./chaincodetemplate.go")
	// check(err)
	// fmt.Print(string(dat))

	// f, err := os.Open("./chaincodetemplate.go")
	// check(err)

	// b1 := make([]byte, 5)
	// n1, err := f.Read(b1)
	// check(err)
	// fmt.Printf("%d bytes: %s\n", n1, string(b1[:n1]))

	// o2, err := f.Seek(6, 0)
	// check(err)
	// b2 := make([]byte, 2)
	// n2, err := f.Read(b2)
	// check(err)
	// fmt.Printf("%d bytes @ %d: ", n2, o2)
	// fmt.Printf("%v\n", string(b2[:n2]))

	// o3, err := f.Seek(6, 0)
	// check(err)
	// b3 := make([]byte, 2)
	// n3, err := io.ReadAtLeast(f, b3, 2)
	// check(err)
	// fmt.Printf("%d bytes @ %d: %s\n", n3, o3, string(b3))

	// _, err = f.Seek(0, 0)
	// check(err)

	// r4 := bufio.NewReader(f)
	// b4, err := r4.Peek(5)
	// check(err)
	// fmt.Printf("5 bytes: %s\n", string(b4))

	// f.Close()

}


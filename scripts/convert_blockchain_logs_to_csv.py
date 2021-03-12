#TODO: mkdir csv if it does not exist. If it exists then rm csv/*


#!/usr/bin/env python

import json
import os
import collections
import re
import csv


#the extract function is used from: 
#https://hackersandslackers.com/extract-data-from-complex-json-python/

#fields contains the keys in json file which will be extracted
fields = ["timestamp","tx_id","Mspid", "activity_name", "function_args", "endorsers_id", "tx_status", "readkeys", "writekeys", "rangekeys", "case_id"]



#csv_path is the path to the output file, in which the extracted data is written in csv format
csv_path ="/home/ubuntu/HyperLedgerLab/csv/csvblockchain.csv"

file_dir="data"


def scan_files(path):
    
    case_id=1
    
    with open(csv_path,"w") as f:
       
        f.write("timestamp;tx_id;creatorid;activity_name;function_args;endorsers_id;tx_status;readkeys;writekeys;rangekeys;case_id\n")
        f.close()
    dir_dict={}
    
    
    #all files in the directory are scanned, then the name, and extension of each file is extracted,
    #a dictionary is created in which keys are the index of each file, and the values are DirEntry of files
    #finaly in ordered_directory_dict all files are sorted based on their indecies
    for file_path in os.scandir(path):
        
        if file_path.is_file():
            base_name= os.path.basename(file_path)
            name, extension = os.path.splitext(base_name)

            if(extension ==".json"):
                dir_dict[int(name)]= file_path
    ordered_directory_dict=collections.OrderedDict(sorted(dir_dict.items()))
        
   
    #looping through all json files 
    for _ , file_path in ordered_directory_dict.items():
        
 
        file_values=[]
    
        #reading one file
        with open(file_path) as json_file:
            
            json_data = json.load(json_file)
            


            #TIMESTAMP
            field_values=[]
            try:
                res = json_data['data']['data']
                resl = len(json_data['data']['data'])
                for x in range(resl):
                    ires = res[x]['payload']['header']['channel_header']['timestamp']
                    field_values.append(ires)
            except Exception:
                field_values.append("NULL")
                pass

            file_values.append(field_values)

            #TX_ID
            field_values=[]
            try:
                res = json_data['data']['data']
                resl = len(json_data['data']['data'])
                for x in range(resl):
                    ires = res[x]['payload']['header']['channel_header']['tx_id']
                    field_values.append(ires)
            except Exception:
                field_values.append("NULL")
                pass

            file_values.append(field_values)

            #CREATOR_ID
            field_values=[]
            try:
                res = json_data['data']['data']
                resl = len(json_data['data']['data'])
                for x in range(resl):
                    ires = res[x]['payload']['header']['signature_header']['creator']['Mspid']
                    field_values.append(ires)
            except Exception:
                field_values.append("NULL")
                pass

            file_values.append(field_values)



            #FUNCTION_NAME     
            field_values=[]
            try:
                res = json_data['data']['data']
                resl = len(json_data['data']['data'])
                for x in range(resl):
                    ires = res[x]['payload']['data']['actions'][0]['payload']['chaincode_proposal_payload']['input']['chaincode_spec']['input']['args'][0]['data']
                    restr = bytes(ires).decode("utf8")
                    field_values.append(restr)
            except Exception:
                field_values.append("NULL")
                pass

            file_values.append(field_values)

            #FUNCTION_ARGS
            field_values=[]
            try:
                res = json_data['data']['data']
                resl = len(json_data['data']['data'])
                for x in range(resl):
                    arg2 = res[x]['payload']['data']['actions'][0]['payload']['chaincode_proposal_payload']['input']['chaincode_spec']['input']['args'][1]['data']
                    restr = bytes(arg2).decode("utf8")
                    field_values.append(restr)
            except Exception:
                field_values.append("NULL")
                pass

            file_values.append(field_values)

            #ENDORSERS
            field_values=[]
            try:
                res = json_data['data']['data']
                resl = len(json_data['data']['data'])
                for x in range(resl):
                    restr = ''
                    endorsements = res[x]['payload']['data']['actions'][0]['payload']['action']['endorsements']
                    endl = len(res[x]['payload']['data']['actions'][0]['payload']['action']['endorsements'])
                    for y in range(endl):
                        eachend = endorsements[y]['endorser']['Mspid']
                        restr += eachend
                        restr += ' ' 
                    field_values.append(restr)
            except Exception:
                field_values.append("NULL")
                pass

            file_values.append(field_values)

            #TX_STATUS
            tx_failures = ["VALID", "NIL_ENVELOPE", "BAD_PAYLOAD", "BAD_COMMON_HEADER", "BAD_CREATOR_SIGNATURE", "INVALID_ENDORSER_TRANSACTION", "INVALID_CONFIG_TRANSACTION", "UNSUPPORTED_TX_PAYLOAD", "BAD_PROPOSAL_TXID", "DUPLICATE_TXID", "ENDORSEMENT_POLICY_FAILURE", "MVCC_READ_CONFLICT", "PHANTOM_READ_CONFLICT", "UNKNOWN_TX_TYPE", "TARGET_CHAIN_NOT_FOUND", "MARSHAL_TX_ERROR", "NIL_TXACTION", "EXPIRED_CHAINCODE", "CHAINCODE_VERSION_CONFLICT", "BAD_HEADER_EXTENSION", "BAD_CHANNEL_HEADER", "BAD_RESPONSE_PAYLOAD", "BAD_RWSET", "ILLEGAL_WRITESET", "INVALID_WRITESET", "INVALID_CHAINCODE", "NOT_VALIDATED", "INVALID_OTHER_REASON"]

            field_values=[]
            try:
                res = json_data['metadata']['metadata'][2]
                resl = len(res)
                for x in range(resl):
                    tx_status = tx_failures[res[x]]
                    if res[x] == 254:
                       tx_status = tx_failures[26]
                    elif res[x] == 255:
                       tx_status = tx_failures[27]
                    field_values.append(tx_status)
            except Exception:
                field_values.append("NULL")
                pass

            file_values.append(field_values)

            #READ_KEYS
            field_values=[]
            try:
                res = json_data['data']['data']
                resl = len(json_data['data']['data'])
                for x in range(resl):
                    readkeys=''
                    #numreads = len(res[x]['payload']['data']['actions'][0]['payload']['action']['proposal_response_payload']['extension']['results']['ns_rwset'][0]['rwset']['reads'])
                    numreads = len(res[x]['payload']['data']['actions'][0]['payload']['action']['proposal_response_payload']['extension']['results']['ns_rwset'][1]['rwset']['reads'])
                    for y in range(numreads):
                        #key = res[x]['payload']['data']['actions'][0]['payload']['action']['proposal_response_payload']['extension']['results']['ns_rwset'][0]['rwset']['reads'][y]['key']   
                        key = res[x]['payload']['data']['actions'][0]['payload']['action']['proposal_response_payload']['extension']['results']['ns_rwset'][1]['rwset']['reads'][y]['key']   
                        readkeys = readkeys + ' ' + key
		    
                    field_values.append(readkeys)
            except Exception:
                field_values.append("NULL")
                pass

            file_values.append(field_values)


            #WRITE_KEYS
            field_values=[]
            try:
                res = json_data['data']['data']
                resl = len(json_data['data']['data'])
                for x in range(resl):
                    writekeys=''
                    #numwrites = len(res[x]['payload']['data']['actions'][0]['payload']['action']['proposal_response_payload']['extension']['results']['ns_rwset'][0]['rwset']['writes'])
                    numwrites = len(res[x]['payload']['data']['actions'][0]['payload']['action']['proposal_response_payload']['extension']['results']['ns_rwset'][1]['rwset']['writes'])
                    for y in range(numwrites):
                        #key = res[x]['payload']['data']['actions'][0]['payload']['action']['proposal_response_payload']['extension']['results']['ns_rwset'][0]['rwset']['writes'][y]['key']
                        key = res[x]['payload']['data']['actions'][0]['payload']['action']['proposal_response_payload']['extension']['results']['ns_rwset'][1]['rwset']['writes'][y]['key']
                        writekeys = writekeys + ' ' + key

                    field_values.append(writekeys)
            except Exception:
                field_values.append("NULL")
                pass

            file_values.append(field_values)


            #RANGE_KEYS
            field_values=[]
            try:
                res = json_data['data']['data']
                resl = len(json_data['data']['data'])
                for x in range(resl):
                    try:
                        rangekeys=''
                        #numrange = len(res[x]['payload']['data']['actions'][0]['payload']['action']['proposal_response_payload']['extension']['results']['ns_rwset'][0]['rwset']['range_queries_info'][0]['raw_reads']['kv_reads'])
                        numrange = len(res[x]['payload']['data']['actions'][0]['payload']['action']['proposal_response_payload']['extension']['results']['ns_rwset'][1]['rwset']['range_queries_info'][0]['raw_reads']['kv_reads'])
                        for y in range(numrange):
                            #key = res[x]['payload']['data']['actions'][0]['payload']['action']['proposal_response_payload']['extension']['results']['ns_rwset'][0]['rwset']['range_queries_info'][0]['raw_reads']['kv_reads'][y]['key']
                            key = res[x]['payload']['data']['actions'][0]['payload']['action']['proposal_response_payload']['extension']['results']['ns_rwset'][1]['rwset']['range_queries_info'][0]['raw_reads']['kv_reads'][y]['key']
                            rangekeys = rangekeys + ' ' + key
                        field_values.append(rangekeys)
                    except Exception:
                        field_values.append("NULL")
                        pass
            except Exception:
                #print(Exception)
                field_values.append("NULL")
                pass

            file_values.append(field_values)



            json_file.close()

        case_id=csv_write(fields,file_values,csv_path,case_id)
                
    return_value=caseid_write(csv_path)
    return_value2=key_based_caseid(csv_path) 
    return_value3=activity_based_caseid(csv_path)

def csv_write(fields, data,path,case_id):
    
    
    count=0
    with open(path,"a") as f:
        
        i = 0

        for i in range(len(data[0])):

            for j in range(len(data)):
                                    
                if (i < len(data[j])):
                    f.write("\"%s\"" % data[j][i])
                    
                    if(data[j][i]=="viewEHR"):
                        case_id+=1
                        count=1
                else:
                    f.write("\"\"")
                if(j < len(data)-1):
                    f.write(";")
            f.write(";")
            f.write(str(case_id))
            f.write("\n")
        
        if(count == 0):
            case_id+=1
        
        f.close()
        return case_id
    


def is_phrase_in(phrase, text):
    return re.search(r"\b{}\b".format(phrase), text, re.IGNORECASE) is not None

def activity_based_caseid(path):
    file = open(path)
    reader = csv.reader((x.replace('\0', '') for x in file), delimiter=';')
    new_lines = list(reader)
    for i in range(len(new_lines)):
        new_lines[i][10]=0

    activity_name=[]
    for i in range(len(new_lines)):
        if i != 0 and new_lines[i][3] != 'NULL' and new_lines[i][3] != 'deploy' and new_lines[i][3] != 'initLedger' and new_lines[i][3] not in activity_name:
           activity_name.append(new_lines[i][3])

    for k in range(len(activity_name)):
        case_id=1
        for i in range(len(new_lines)):
            if i != 0 and new_lines[i][3]==activity_name[k]:
               new_lines[i][10]=case_id
               case_id+=1

    writer = csv.writer(open('/home/ubuntu/HyperLedgerLab/csv/activity_based_caseid_blockchainlog.csv', 'w'))
    writer.writerows(new_lines)


def key_based_caseid(path):
    unique_keys=[]
    file = open(path)
    reader = csv.reader((x.replace('\0', '') for x in file), delimiter=';')
    lines = list(reader)
    for i in range(len(lines)):
        lines[i][10]=0
    for i in range(len(lines)):
        readkey = []
        writekey = []
        rangekey = []
        if i != 0 and lines[i][3] != 'NULL' and lines[i][3] != 'deploy' and lines[i][3] != 'initLedger':
           readkey += (lines[i][7].strip()).split()
           for k in readkey:
             if k not in unique_keys and k != 'NULL' and k != '':
                unique_keys.append(k)
           writekey += (lines[i][8].strip()).split()
           for k in writekey:
             if k not in unique_keys and k != 'NULL' and k != '':
                unique_keys.append(k)
           rangekey += (lines[i][9].strip()).split()
           for k in rangekey:
             if k not in unique_keys and k != 'NULL' and k != '':
                unique_keys.append(k)

    key_dependencies=[]
    key_dependencies.append(['keys','number_of_dependencies'])
    #print(unique_keys)
    for key in unique_keys:
        numdependencies=0
        new_lines=[]
        new_lines.append(["timestamp","tx_id","Mspid", "activity_name", "function_args", "endorsers_id", "tx_status", "readkeys", "writekeys", "rangekeys", "case_id"])

        for i in range(len(lines)):
            if i != 0 and lines[i][3] != 'NULL' and lines[i][3] != 'deploy' and lines[i][3] != 'initLedger':
               if (key != '') and (is_phrase_in(key, lines[i][7].strip()) or is_phrase_in(key, lines[i][8].strip()) or is_phrase_in(key, lines[i][9].strip())):
                   new_lines.append(lines[i])
                   numdependencies+=1
        key_dependencies.append([key,numdependencies]) 

        activity_name=[]
        for i in range(len(new_lines)):
            if new_lines[i][3] not in activity_name:
               activity_name.append(new_lines[i][3])
        for k in range(len(activity_name)):
            case_id=1
            for i in range(len(new_lines)):
                if new_lines[i][3]==activity_name[k]:
                   new_lines[i][10]=case_id 
                   case_id+=1
        writer = csv.writer(open('/home/ubuntu/HyperLedgerLab/csv/%s_blockchainlog.csv' % key, 'w'))
        writer.writerows(new_lines)
    
    writer = csv.writer(open('/home/ubuntu/HyperLedgerLab/csv/key_dependencies.csv', 'w'))
    writer.writerows(key_dependencies)

def caseid_write(path):
    case_id=0
    line_count=0
    write_keys=[]
    file = open(path)
    reader = csv.reader((x.replace('\0', '') for x in file), delimiter=';')
    for row in reader:
        if line_count == 0:
           checking=0
        elif row[3] != 'NULL' and row[3] != 'deploy' and row[3] != 'initLedger' and row[8] != '' and row[8] != 'NULL':
           write_keys.append(row[8])
        line_count+=1

    file.seek(0)
    reader = csv.reader((x.replace('\0', '') for x in file), delimiter=';')
    lines = list(reader)
    for i in range(len(lines)):
        lines[i][10]=0

    for key in write_keys:
        case_id+=1
        for i in range(len(lines)):
            if lines[i][3] != 'NULL' and lines[i][3] != 'deploy' and lines[i][3] != 'initLedger':
               if (key != '') and (is_phrase_in(key.strip(), lines[i][7].strip()) or is_phrase_in(key.strip(), lines[i][8].strip()) or is_phrase_in(key.strip(), lines[i][9].strip())) and (lines[i][10] == 0):
               #if (key != '') and (key.strip() in lines[i][7].strip() or key.strip() in lines[i][8].strip() or key.strip() in lines[i][9].strip()) and (lines[i][10] == 0):
               #if (key != '') and (key in lines[i][7].strip() or key in lines[i][8].strip() or key in lines[i][9].strip()) and (lines[i][10] == 0):
                  #print(key)
                  #print(lines[i])
                  lines[i][10]=case_id
                  #print(lines[i])


    new_lines=[]
    increment=0.00001
    for j in range(case_id):
        activity_name=[]
        for i in range(len(lines)):
            if (lines[i][10]==j) and (lines[i][3] not in activity_name):
                  activity_name.append(lines[i][3])
        for k in range(len(activity_name)):
            for l in range(len(lines)):
                if lines[l][10]==j and lines[l][3]==activity_name[k]:
                   one_row = lines[l]
                   one_row.append(lines[l][10]+increment)
                   #lines[l][11]=lines[l][10]+increment
                   increment+=0.00001
            increment=0.00001
        for l in range(len(lines)):
                if lines[l][10]==j:
                   new_lines.append(lines[l])
        #writer = csv.writer(open('/home/ubuntu/HyperLedgerLab/csv/%s_caseidcsvblockchain.csv' % j, 'w'))
        #writer.writerows(new_lines)
        #new_lines=[]

    writer = csv.writer(open('/home/ubuntu/HyperLedgerLab/csv/caseidcsvblockchain.csv', 'w'))
    writer.writerows(lines)
    a=10 
    return a 
 
def json_extract(obj, key):
    """Recursively fetch values from nested JSON."""
    arr = []

    def extract(obj, arr, key):
        """Recursively search for values of key in JSON tree."""
        if isinstance(obj, dict):
            for k, v in obj.items():
                if isinstance(v, (dict, list)):
                    extract(v, arr, key)
                elif k == key:
                    arr.append(v)
        elif isinstance(obj, list):
            for item in obj:
                extract(item, arr, key)
        return arr

    values = extract(obj, arr, key)
    return values


scan_files(file_dir)

# csv-2-redis

    - A simple module to upload data from CSV files to Redis Server running locally / remotely.

    - Uses 'csv-parse' module for CSV parsing. 


###Installation
---------------
```sh
npm install csv-2-redis

```
> Current version is tested with Node v0.10.21 and above.


###CLI 
------
 ```
 * csv-2-redis "myData.csv" "127.0.0.1" "6379" 12

 * csv-2-redis "myData.csv" localhost default default
    
 * csv-2-redis "myData.csv" local default  3

 * csv-2-redis "myData.csv" localhost default-port 10
    
 * csv-2-redis "myData.csv" local default-port 0

 * csv-2-redis "myData.csv" "some-server-name.com" "some-port-number" "select-db" auth-key"
 ```
 

###Options
-----------
* -g, --group    : Specify this option to group values by first column entries
* -t, --test     : Specify this option to test a random data, after successful data upload to Redis

###Example
---------
 1. '-g' / '--group' option specified - Values will be grouped as an array based on first column entries  
    
 Consider the following entries to be our sample.csv
                
 ####Input CSV:
 --------------
              | globalDispatchId |  productName  |  productCategory |
              | ---------------- |  ------------ | -----------------|
              |      13123       |    product11  |         Gx       |
              |      65345       |    product22  |         Bx       |
              |      34234       |    product33  |         Rx       | 
              |      13123       |    product55  |         Zx       |
              |      65345       |    product66  |         Jx       |
            
 ####Output format stored in Redis:
 ----------------------------------
            
            "13123" : [
            {
               "globalDispatchId" : "13123",
               "productName"      : "product11",
               "productCategory"  : "Gx"           
            },
            {
                "globalDispatchId" : "13123",
                "productName"      : "product55",
                "productCategory"  : "Zx" 
            }],
            "65345" : [
            {
               "globalDispatchId" : "65345",
               "productName"      : "product22",
               "productCategory"  : "Bx"           
            },
            {
                "globalDispatchId" : "65345",
                "productName"      : "product66",
                "productCategory"  : "Jx" 
            }],
            "34234" : [
            {
               "globalDispatchId" : "34234",
               "productName"      : "product33",
               "productCategory"  : "Rx"           
            }]
            
 2. without '-g' or '--group' option specified, simple insert as key-value pairs. For repeating entries, values will be overwritten for the same key.
        
 Consider the following entries to be our sample.csv
            
 ####Input CSV:
 --------------
               |globalDispatchId |  productName  |   productCategory |
               |---------------- |  ------------ |  -----------------|
               |     13123       |    product11  |        Gx         |
               |     65345       |    product22  |        Bx         |
               |     34234       |    product33  |        Rx         |
        
 ####Output format stored in Redis:
 ----------------------------------
            "13123" : {
                "globalDispatchId" : "13123",
                "productName"      : "product11",
                "productCategory"  : "Gx"           
            },
            "65345" : {
                "globalDispatchId" : "65345",
                "productName"      : "product22",
                "productCategory"  : "Bx"           
            },
            "34234" : {
                "globalDispatchId" : "34234",
                "productName"      : "product33",
                "productCategory"  : "Rx"           
            }           

###Todo's
---------
    - Write tests
    - Add code comments
    - Rethink optimizations

###License
----------
Free to use and modify. Report any issues you encountered.


###P.S
------
Just drop me a mail anytime and share me your experience & feedbacks. [ just a curious kid, to know people who download..!! :) ]

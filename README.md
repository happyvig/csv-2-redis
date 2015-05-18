# csv-2-redis

A simple module to upload data from CSV files to Redis Server running locally / remotely.


##How to install
----------------

```
npm install csv-2-redis

```

##CLI :
------

 ```
 * csv-2-redis "myData.csv" "127.0.0.1" "6379"

 * csv-2-redis "myData.csv" localhost default

 * csv-2-redis "myData.csv" local default

 * csv-2-redis "myData.csv" localhost default-port

 * csv-2-redis "myData.csv" local default-port

 * csv-2-redis "myData.csv" "some-server-name.com" "some-port-number" "auth-key"
 ```
 

###OPTIONS:
-----------

-group    : To group values by first column entries



Free to use and modify. Report any issues you encountered.
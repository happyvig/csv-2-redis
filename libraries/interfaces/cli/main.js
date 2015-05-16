
// Ex1: csv-2-redis "myData.csv" "127.0.0.1" "6379" -group

// Ex2: csv-2-redis "myData.csv" "some-server-name.com" "some-port-number" "auth-key" -group

'use strict';

var fs = require('fs')
	, parse = require('csv-parse')
	, path = require('path')
	, RedisAdapter = require('../../../libraries/cache-provider').RedisAdapter;

var _srcFileName,_canGroupByFirstColumn;
var testData;

var getRedisCache =  function(){
	var args = process.argv.slice(2);
	_srcFileName = args[0];
	var _redisServer = args[1];
	var _redisPort = args[2];
	var _authKey = args[3] && args[3].indexOf('-group') > -1 ? null : args[3];
	_canGroupByFirstColumn = (args[3] && args[3].toString().indexOf('-group') > -1)
									|| (args[4] && args[4].toString().indexOf('-group') > -1);
	var cache = new RedisAdapter();
	cache.init({server: _redisServer,port  : _redisPort,auth  : _authKey});
	return cache;
};

var loadDataToRedis = function() {

	var parser,rs,csvRecordKey,csvRecords = [];

	try {

		var CacheProvider = getRedisCache();

		/* Using the first line of the CSV data to discover the column names */
		rs = fs.createReadStream(_srcFileName);

		/* set csv parser */
		parser = parse({columns: true, trim: true});

		/* Use the writable stream api */
		var onEachRowRead = function () {
			var currentRecordKey;
			var record;
			if(_canGroupByFirstColumn) {
				while (record = parser.read()) {
					currentRecordKey = record['GlobalDeviceId'];

					if (!csvRecordKey)
						csvRecordKey = currentRecordKey;

					if (csvRecordKey == currentRecordKey) {
						csvRecords.push(record);
					} else {
						CacheProvider.setJson("ActivityInfo", csvRecordKey, csvRecords);
						csvRecords = [];
						csvRecords.push(record);
						csvRecordKey = currentRecordKey;
					}

					testData=currentRecordKey;
				}
				CacheProvider.setJson("ActivityInfo", csvRecordKey, csvRecords);
			}
			else{
				// to be updated
			}
		};

		/* When we are done, test that the parsed output matched what expected */
		var onFinish = function(){
				console.log("Data Load Successful..");

				/* test data fetch */
				console.log('Test Fetch - Last Data...');
				CacheProvider.get("ActivityInfo", testData).then(function (data) {
					if (data)
						console.log("Test Fetch Successful...");
				});

				/* Close the readable stream */
				parser.end();
		};

		/* Catch any parser error */
		var onError = function(err){
			console.log(err.message);
		};

		/* hook handlers */
		parser.on('readable', onEachRowRead);
		parser.on('finish', onFinish);
		parser.on('error', onError);

		/* pipe the file read stream output to the custom parser */
		rs.pipe(parser);

		console.log("Starting Data Load..");
	}
	catch (err) {
		console.log(err);
	}
};

module.exports = loadDataToRedis;
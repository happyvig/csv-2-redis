
// Ex1: csv-2-redis -src "myData.csv" -server "127.0.0.1" -port "6379" -group

// Ex2: csv-2-redis "myData.csv" "some-server-name.com" "some-port-number" "auth-key" -group

'use strict';

var fs = require('fs')
	, path = require('path')
	, parse = require('csv-parse')
	, userArgs = require('commander')
	, Provider = require('../../../libraries/cache-provider')
	, RedisAdapter = Provider.RedisAdapter;

var _srcFileName,_canGroupByFirstColumn,testData;

var getRedisCache =  function(){
	var cache = null;
	userArgs
		.version('0.0.1')
		.arguments('<src> <server> <port> [auth]')
		.action(function(src,server,port,auth){
			userArgs.source = src;
			userArgs.server = server;
			userArgs.port = port;
			userArgs.authKey = auth;
		})
		.option('-g, --group', 'can group by first column?')
		.parse(process.argv);

	if(userArgs.source && userArgs.server && userArgs.port) {
		_srcFileName = userArgs.source;
		_canGroupByFirstColumn = userArgs.group;

		cache = new RedisAdapter();
		cache.init({
			server: userArgs.server,
			port: userArgs.port,
			auth: (userArgs.authKey && JSON.parse(userArgs.authKey)) ? userArgs.authKey : null
		});
	}
	else {
		if (!userArgs.source) {
			console.log("\n error: missing required argument 'source file'\n");
		}
	}
	return cache;
};

var loadDataToRedis = function() {
	var parser,rs,csvRecordKey,csvRecords = [];

	try {
		var CacheProvider = getRedisCache();
		if(CacheProvider) {

			/* Using the first line of the CSV data to discover the column names */
			rs = fs.createReadStream(_srcFileName);

			/* set csv parser */
			parser = parse({columns: true, trim: true});

			/* Use the writable stream api */
			var onEachRowRead = function () {
				var currentRecordKey;
				var record;
				if (_canGroupByFirstColumn) {
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

						testData = currentRecordKey;
					}
					CacheProvider.setJson("ActivityInfo", csvRecordKey, csvRecords);
				}
				else {
					// to be updated
				}
			};

			/* When we are done, test that the parsed output matched what expected */
			var onFinish = function () {
				console.log("\nData Load Successful..");

				/* test data fetch */
				CacheProvider.get("ActivityInfo", testData).then(function (data) {
					if (data)
						console.log("\nTest Fetch Successful...");
					else
						console.log("\nTest Fetch Failed...");
					process.exit(0);
				});

				/* Close the readable stream */
				parser.end();
			};

			/* Catch any parser error */
			var onError = function (err) {
				console.log("\nData Load Failed...");
				console.log(err.message);
				process.exit(0);
			};

			/* hook handlers */
			parser.on('readable', onEachRowRead);
			parser.on('finish', onFinish);
			parser.on('error', onError);

			/* pipe the file read stream output to the custom parser */
			rs.pipe(parser);

			console.log("\nStarting Data Load..");
		}
	}
	catch (err) {
		console.log(err);
	}
};

loadDataToRedis();
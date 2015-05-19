(function(){
	'use strict';

	var fs = require('fs')
		, parse = require('csv-parse')
		, _ = require('underscore')
		, logger = require('./log-manager');

	var randomSeed = function(){ return Math.random() < 0.5; }

	var loadData = function(options) {
		var params = options;
		var extras = params.extras;
		var uArgs = extras && extras.userArgs;
		var parser,rs,csvRecordKey,csvRecords = [],testData;

		try {
			var headerRow = null;
			var CacheProvider = params.cacheInstance;
			var headerFound = false;

			if(CacheProvider) {

				/* Using the first line of the CSV data to discover the column names */
				rs = fs.createReadStream(uArgs.sourceFile);

				/* set csv parser */
				parser = parse({ trim : true, skip_empty_lines : true, columns: null });

				/* Use the writable stream api */
				var onEachRowRead = function () {
					var currentRecordKey, record;
					if (uArgs.canGroupByFirstColumn) {
						while(record = parser.read()) {
							if (headerFound) {
								record = _.object(headerRow, record);
								currentRecordKey = record[headerRow[0]];

								if (!csvRecordKey)
									csvRecordKey = currentRecordKey;

								if (csvRecordKey === currentRecordKey) {
									csvRecords.push(record);
								} else {
									CacheProvider.setJson("ActivityInfo", csvRecordKey, csvRecords);
									csvRecords = [];
									csvRecords.push(record);
									csvRecordKey = currentRecordKey;
								}
								testData = randomSeed() ? currentRecordKey : testData;
							} else {
								headerFound = true;
								headerRow = record;
							}
						}
					}
					else {
						while(record = parser.read()) {
							if (headerFound) {
								record = _.object(headerRow, record);
								csvRecordKey = record[headerRow[0]];
								csvRecords = record;
								CacheProvider.setJson("ActivityInfo", csvRecordKey, csvRecords);
								testData = randomSeed() ? currentRecordKey : testData;
							} else {
								headerFound = true;
								headerRow = record;
							}
						}
					}
				};

				/* When we are done, test that the parsed output matched what expected */
				var onFinish = function () {

					CacheProvider.setJson("ActivityInfo", csvRecordKey, csvRecords);

					logger.log("\nData Load Successful...");

					/* test data fetch */
					CacheProvider.get("ActivityInfo", testData).then(function (data) {
						logger.log('\n[ Test data - ' + testData + ' ]');
						if (data)
							logger.log("\nTest Fetch Successful...");
						else
							logger.log("\nTest Fetch Failed...");
						process.exit(0);
					});

					/* Close the readable stream */
					parser.end();
				};

				/* Catch any parser error */
				var onError = function (err) {
					logger.log("\nData Load Failed...");
					logger.log(err.message);
					process.exit(0);
				};

				/* hook handlers */
				parser.on('readable', onEachRowRead);
				parser.on('finish', onFinish);
				parser.on('error', onError);

				/* pipe the file read stream output to the custom parser */
				rs.pipe(parser);

				logger.log("\nInitiating Redis Connection For Data Load...");
			}
		}
		catch (err) {
			logger.error(err);
		}
	};

	module.exports = {loadData:loadData};

}());

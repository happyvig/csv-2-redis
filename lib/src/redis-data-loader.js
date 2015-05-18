(function(){
	'use strict';

	var fs = require('fs')
		, parse = require('csv-parse');

	var loadData = function(options) {
		var self = this;
		this.params = options;
		this.extras = this.params.extras;
		this.uArgs = this.extras && this.extras.userArgs;
		var parser,rs,csvRecordKey,csvRecords = [],testData;

		try {

			var CacheProvider = this.params.cacheInstance;

			if(CacheProvider) {

				/* Using the first line of the CSV data to discover the column names */
				rs = fs.createReadStream(this.uArgs.sourceFile);

				/* set csv parser */
				parser = parse({columns: true, trim: true});

				/* Use the writable stream api */
				var onEachRowRead = function () {
					var currentRecordKey;
					var record;
					if (self.uArgs.canGroupByFirstColumn) {
						while (record = parser.read()) {

							currentRecordKey = record['GlobalDeviceId'];

							if (!csvRecordKey) csvRecordKey = currentRecordKey;

							if (csvRecordKey === currentRecordKey) {
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
						process.exit(0);
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

	module.exports = {loadData:loadData};

}());

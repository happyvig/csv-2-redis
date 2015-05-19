
// Ex1: csv-2-redis "myData.csv" 127.0.0.1 6379 14 --group
// Ex2: csv-2-redis <some_csv.csv> <some-server-name.com> <some-port-number> <select-db> <auth-key> -g

(function () {
	'use strict';

	var commandLineParser = require('commander')                    // command line helper
		, RedisDataLoader = require('../../src/redis-data-loader')
		, CacheCreator = require('../../src/cache-creator');

	var parseUserArguments = function(argv){
		var uArgs = {};
		commandLineParser
			.version('0.0.1')
			.arguments('<src> <server> <port> <db> [auth]')// authentication reqd. for remote servers/optional for local server
			.action(function(src,server,port,db,auth){
				uArgs.sourceFile = src;
				uArgs.server = server;
				uArgs.port = port;
				uArgs.selectDb = db;
				uArgs.authKey = auth;
			})
			.option('-g, --group', 'can group by first column?')
			.parse(argv);

		uArgs.canGroupByFirstColumn = commandLineParser.group;
		return uArgs;
	};

	var userArgs = parseUserArguments(process.argv);

	// auto-start data load in to redis
	RedisDataLoader.loadData({
		cacheInstance : CacheCreator.createCache(userArgs),
		extras : {userArgs : userArgs}
	});

}());



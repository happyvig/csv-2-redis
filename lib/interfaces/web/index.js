
var Loader = require("./main");
var CacheCreator = require('../../src/cache-creator');

var params = {
	sourceFile: 'C:/Users/vkumar2/Desktop/ActivityInformation.csv',
	server: 'localhost',
	port:'default'
};

var cache = null;
var userArgs = null;

var prepare = function (data){
	userArgs = data;
	cache = CacheCreator.createCache(data);
};

var load = function(){
	Loader({
		cacheInstance: cache,
		extras: {
			userArgs : userArgs
		}
	});
};

var RedisLoader = {
	prepareCache   : prepare,
	loadDataToRedis: load
};

module.exports = RedisLoader;


(function(){
	'use strict';

	var RedisAdapter = require('./redis-adapter').RedisAdapter;    // custom redis adapter

	var createCache = function(params){
		var cache = null;
		if(params.sourceFile && params.server && params.port) {
			cache = new RedisAdapter();
			cache.init({
				server: params.server,
				port: params.port,
				auth: (params.authKey && JSON.parse(params.authKey)) ? params.authKey : null
			});
		}
		else {
			if (!params.sourceFile) {
				console.log("\n error: missing required argument 'source file'\n");
			}
		}
		return cache;
	};

	module.exports = { createCache : createCache };

}());


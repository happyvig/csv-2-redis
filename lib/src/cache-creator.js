
(function(){
	'use strict';

	var RedisAdapter = require('./redis-adapter').RedisAdapter    // custom redis adapter
		, logger = require('./log-manager');

	var createCache = function(params){
		var cache = null;
		if(params.sourceFile && params.server && params.port) {
			cache = new RedisAdapter();
			cache.init({
				server: params.server,
				port: params.port,
				selectDb : params.selectDb,
				auth: params.authKey
			});
		}
		else {
			if (!params.sourceFile) {
				logger.warn("\n error: missing required argument 'source file'\n");
			}
		}
		return cache;
	};

	module.exports = { createCache : createCache };

}());


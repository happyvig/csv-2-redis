(function(){
	'use strict';

	var redis = require("redis")
		, RSVP = require('rsvp')
		, logger = require('./log-manager');


	var DB = null   // connected redis client global instance
		, environment = ":dev:";

	/**
	 * Adapter to connect to local / remote Redis server and set/get values.
	 * @constructor
	 */
	var RedisAdapter = function () {
		/**
		 * Initializes the Redis connection with given configurations.
		 * @param params
		 */
		this.init = function (params) {
			if (params && params.server && params.port) {
				/* defaults */
				params.server = (params.server === 'localhost' || params.server === 'local') ? '127.0.0.1' : params.server;
				params.port = (params.port === 'default' || params.port === 'default-port') ? 6379 : params.port;
				params.selectDb = params.selectDb && parseInt(params.selectDb);
				params.selectDb = (params.selectDb > 15 || params.selectDb < 0 ) ? 0 : params.selectDb;

				/* redis client connection */
				DB = redis.createClient(parseInt(params.port), params.server, {});

				DB.select(params.selectDb);

				DB.on("ready", function (err) {
					if(!err)
						logger.info("\nRedis Connection Status :: READY ");
					else
						logger.error("\nRedis Connection Status :: NOT READY ");
				});

				DB.on("error", function (err) {
					logger.error("\nRedis Connection Error : " + err);
				});

				DB.on("end", function (err) {
					logger.log("\nRedis Connection Status - CLOSED");
				});

				/* authentication, if required */
				if (DB && params.auth)
					DB.auth(params.auth, function(){
						// to be updated later
					});
			}
		};

		/**
		 * Returns the value of the given key if present, null otherwise.
		 * @param domainset
		 * @param key
		 * @returns {RSVP.Promise}
		 */
		this.get = function (domainset, key) {
			return new RSVP.Promise(function (resolve, reject) {
				try {
					DB.get(domainset + environment + key, function (err, data) {
						if (!err)
							resolve(data);
						else
							reject(null);
					});
				}
				catch (err) {
					reject(null);
				}
			});
		};

		/**
		 * Sets the given value into the given key.
		 * @param domainset
		 * @param key
		 * @param value
		 * @returns {RSVP.Promise}
		 */
		this.set = function (domainset, key, value) {
			return new RSVP.Promise(function (resolve, reject) {
				try {
					DB.set(domainset + environment + key, value, function (err, res) {
						if (!err && res === "OK")
							resolve(true);
						else
							reject(false);
					});
				}
				catch (err) {
					reject(false);
				}
			});
		};

		/**
		 * Gets the value as JSON for the given key.
		 * @param domainset
		 * @param key
		 * @returns {RSVP.Promise}
		 */
		this.getJson = function (domainset, key) {
			return new RSVP.Promise(function (resolve, reject) {
				try {
					DB.get(domainset + environment + key, function (err, data) {
						if (!err) {
							try {
								if (data)
									resolve(JSON.parse(data));
								else
									resolve(null);
							} catch (err) {
								reject(null);
							}
						}
						else
							reject(null);
					});
				}
				catch (err) {
					reject(null);
				}
			});
		};

		/**
		 * Sets the value as JSON into the given key.
		 * @param domainset
		 * @param key
		 * @param value
		 * @returns {RSVP.Promise}
		 */
		this.setJson = function setJson(domainset, key, value) {
			return new RSVP.Promise(function (resolve, reject) {
				try {
					DB.set(domainset + environment + key, JSON.stringify(value), function (err, res) {
						if (!err && res === "OK")
							resolve(true);
						else
							reject(false);
					});
				}
				catch (err) {
					reject(false);
				}
			});
		};
	};

	/**
	 * Export the adapter to be used by the clients.
	 * @type {{RedisAdapter: RedisAdapter}}
	 */
	module.exports = { RedisAdapter: RedisAdapter  };

}());


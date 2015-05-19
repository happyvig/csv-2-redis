
(function(){

	'use strict';

	var chalk =  require('chalk');

	var masterChalks = [ 'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray' ];

	var log = function(t){ console.log(t) };

	var validateChalks = function(colorProps){
		for(var key in colorProps){
			if (colorProps.hasOwnProperty(key)) {
				if(masterChalks.indexOf(colorProps[key]) == -1)
					colorProps[key] = 'white';
			}
		}
	};

	var Logger = function(options){

		var init = function() {
			validateChalks(options.colors);
		};

		init();

		this._info = chalk[options.colors.info];

		this._error = chalk['bold'][options.colors.error];

		this._warn = chalk[options.colors.warn];

		this._log = chalk[options.colors.log];
	};

	Logger.prototype.info = function(logData){
		log(this._info(logData));
	};

	Logger.prototype.error = function(logData){
		log(this._error(logData));
	};

	Logger.prototype.warn = function(logData){
		log(this._warn(logData));
	};

	Logger.prototype.log = function(logData){
		log(this._log(logData));
	};

	module.exports = new Logger({
		colors: {
			info : 'green',	error: 'red', warn : 'yellow', log  : 'cyan'
		}
	});

}());


var assert = require('assert');
var pubsubclient = null;

var pubsubclientclass = require(__dirname+'/../PubSubClient');

describe('PubSubClient', function() {	
	var init = null;

	before(function() {
		var config = require(__dirname+'/../../Config');
		var redis = require('redis');

		init = function(callback) {
			pubsubclient = new pubsubclientclass(redis, config, function() {
				callback();
			});
		};
		
	});
	
	beforeEach(function() {
		if (pubsubclient) pubsubclient.reset();
	});

	describe('#subscribe()', function () {
		it('Receives a message on the specified channel', function (done) {
			var callback = function() {
				pubsubclient.subscribe('channel', function(msg) {
					assert.equal(msg.content, 'message');
					pubsubclient.unsubscribe('channel');
					done();
				});
				pubsubclient.publish('channel', 'id', 'message');
			};
			init(callback);
		});
	});

	describe('#subscribe()', function () {
		it('Receives a message on the specified channel and subject', function (done) {
			var callback = function() {
				var count = 0
				pubsubclient.subscribe('channel.*', function(msg) {
					assert.equal(msg.content, 'message');
					
					if (++count === 2) {
						pubsubclient.unsubscribe('channel');
						done();
					}
				});
				pubsubclient.subscribe('channel.subject', function(msg) {
					assert.equal(msg.content, 'message');
					
					if (++count === 2) {
						pubsubclient.unsubscribe('channel');
						done();
					}
				});
				pubsubclient.publish('channel.subject', 'id', 'message');
			};
			init(callback);
		});
	});	

	describe('#unsubscribe()', function () {
		it('Stops a subscription', function (done) {
			var callback = function() {
				var count = 0
				var unsubscribed = false; 
				pubsubclient.subscribe('channel.subject', function(msg) {
					assert.equal(msg.content, 'message');
					
					pubsubclient.unsubscribe('channel.subject');
					
					if (unsubscribed) {
						assert.equal(false, true);
					}
					else { 
						unsubscribed = true;
						pubsubclient.publish('channel.subject', 'id', 'message');
					}
					
				});
				pubsubclient.subscribe('channel.*', function(msg) {
					assert.equal(msg.content, 'message');

					if (++count === 2) {
						//pubsubclient.unsubscribe('channel.*');
						done();
					}
				});
				pubsubclient.publish('channel.subject', 'id', 'message');
			};
			init(callback);
		});
	});	

});
var assert = require('assert');
var pubsubclient = null;

pubsubclient = require(__dirname+'/../PubSubClient');

describe('PubSubClient', function() {	
	var init = null;

	before(function() {
		var config = require(__dirname+'/../config');
		var redis = require('redis');
		
		pubsubclient = require(__dirname+'/../PubSubClient');
		
		init = function(callback) {
			pubsubclient.init(redis, config, function() {
				callback();
			});
		};
		
	});
	
	beforeEach(function() {
		
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
				pubsubclient.subscribe('channel', function(msg) {
					assert.equal(msg.content, 'message');
					
					if (++count === 2) {
						pubsubclient.unsubscribe('channel');
						done();
					}
				}, 'subject');
				pubsubclient.subscribe('channel', function(msg) {
					assert.equal(msg.content, 'message');
					
					if (++count === 2) {
						pubsubclient.unsubscribe('channel');
						done();
					}
				});
				pubsubclient.publish('channel', 'id', 'message', 'subject');
			};
			init(callback);
		});
	});	
	
	describe('#unsubscribe()', function () {
		it('Stops a subscription', function (done) {
			var callback = function() {
				var count = 0
				var unsubscribed = false; 
				pubsubclient.subscribe('channel', function(msg) {
					assert.equal(msg.content, 'message');
					
					pubsubclient.unsubscribe('channel', 'subject');
					
					if (unsubscribed) {
						assert.equal(false, true);
					}
					else { 
						unsubscribed = true;
						pubsubclient.publish('channel', 'id', 'message', 'subject');
					}
					
				}, 'subject');
				pubsubclient.subscribe('channel', function(msg) {
					assert.equal(msg.content, 'message');
					
					if (++count === 2) {
						pubsubclient.unsubscribe('channel');
						done();
					}
				});
				pubsubclient.publish('channel', 'id', 'message', 'subject');
			};
			init(callback);
		});
	});	
});
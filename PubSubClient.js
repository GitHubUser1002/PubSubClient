function PubSubClient(redis, config, onComplete) {
	var Utils = require('./Utils');
	this.Config = config;
	var events = require('events');
	var ee = new events.EventEmitter();
	
	this.pclient = redis.createClient(this.Config.redis.port, this.Config.redis.host);
	this.sclient = redis.createClient(this.Config.redis.port, this.Config.redis.host);
	
	this.sclient.on('message', function (channel, message) {
		if (!Utils.isJsonValid(message)) return;
		
		var deserializedMsg = JSON.parse(message);
		
		if (deserializedMsg && deserializedMsg.channel) ee.emit('message', deserializedMsg);
	});
	
	var ChannelRegistarClass = require('./ChannelRegistar');
	this.channelRegistar = new ChannelRegistarClass();
	channelRegistar = this.channelRegistar
	
	this.sclient.on('subscribe', function (channel, count) {
		ee.on('message', function(msg) {
			var callbacks = channelRegistar.search(msg.channel);

			callbacks.forEach(function (callback) { callback(msg); });
		});
		
		if (onComplete) onComplete();
	});
	
	this.sclient.subscribe(this.Config.redis.channel);
	
	this.subscribedChannels = {};
};

PubSubClient.prototype.subscribe = function(channel, callback) {
	this.channelRegistar.register(channel, callback);
};

PubSubClient.prototype.unsubscribe = function(channel) {
	this.channelRegistar.remove(channel);
};
	
PubSubClient.prototype.publish = function(channel, id, content) {
	this.pclient.publish(this.Config.redis.channel, JSON.stringify({
		'id'			:		id,
		'timestamp'		:		new Date(),
		'content'		:		content,
		'channel'		:		channel
	}));
};

PubSubClient.prototype.reset = function reset() {
	this.channelRegistar.clear();
};

module.exports = PubSubClient;
var events = require('events');
var ee = new events.EventEmitter();

var Utils = require('./Utils');

var Config = null;

var pclient = null;
var sclient = null;

function init(redis, config, onComplete) {
	Config = config;
	pclient = redis.createClient(Config.redis.port, Config.redis.host);
	sclient = redis.createClient(Config.redis.port, Config.redis.host);
	sclient.on('message', function (channel, message) {
		if (!Utils.isJsonValid(message)) return;
		
		var deserializedMsg = JSON.parse(message);
		
		if (deserializedMsg && deserializedMsg.channel) ee.emit('message', deserializedMsg);
	});
	sclient.on('subscribe', function (channel, count) {
		ee.on('message', function(msg) {
			var callbacks = channelRegistar.search(msg.channel);

			callbacks.forEach(function (callback) { callback(msg); });
		});
		
		if (onComplete) onComplete();
	});
	sclient.subscribe(Config.redis.channel);
};

var subscribedChannels = {};
var ChannelRegistarClass = require('./ChannelRegistar');
var channelRegistar = new ChannelRegistarClass();

function subscribe(channel, callback) {
	channelRegistar.register(channel, callback);
};

function unsubscribe(channel) {
	channelRegistar.remove(channel);
};
	
function publish(channel, id, content) {
	pclient.publish(Config.redis.channel, JSON.stringify({
		'id'			:		id,
		'timestamp'		:		new Date(),
		'content'		:		content,
		'channel'		:		channel
	}));
};

function reset() {
	channelRegistar.clear();
};

module.exports = {
	'subscribe' 	: subscribe,
	'unsubscribe' 	: unsubscribe,
	'publish' 		: publish,
	'init'			: init,
	'reset'			: reset
};
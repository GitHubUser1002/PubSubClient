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
		if (!Utils.isJsonValid(message)) {
			return;
		}
		
		var deserializedMsg = JSON.parse(message);
		
		if (deserializedMsg && deserializedMsg.channel) ee.emit(deserializedMsg.channel, deserializedMsg);
	});
	sclient.on('subscribe', function (channel, count) {
		if (onComplete) onComplete();
	});
	sclient.subscribe(Config.redis.channel);
};

var subscribedChannels = {};

function subscribe(channel, callback, subject) {
	if (!subject) subject = 'All';
	
	var channelJustCreated = false; 
	if (!subscribedChannels[channel]) {
		subscribedChannels[channel] = {};
		channelJustCreated = true;
	}
	subscribedChannels[channel][subject] = callback;
	if (channelJustCreated) {
		ee.on(channel, function(msg) {
			if (subscribedChannels[msg.channel] && subscribedChannels[msg.channel][msg.subject]) {
				subscribedChannels[msg.channel][msg.subject](msg);
			} 
			if (msg.subject != 'All' && subscribedChannels[msg.channel]['All']) {
				subscribedChannels[msg.channel]['All'](msg);
			}
		});
	}
};

function unsubscribe(channel, subject) {
	if (!subscribedChannels[channel]) return;
	
	if (subject && subscribedChannels[channel][subject]) {
		subscribedChannels[channel][subject] = null;
		if (Object.keys(subscribedChannels[channel]).length === 0) removeChannel(channel);
	}
	else removeChannel(channel);
	
};

function removeChannel(channel) {
	ee.removeAllListeners(channel);
	subscribedChannels[channel] = null;
};
	
function publish(channel, id, content, subject) {
	if (subject) pclient.publish(Config.redis.channel, JSON.stringify({
		'id'			:		id,
		'timestamp'		:		new Date(),
		'subject'		:		subject,
		'content'		:		content,
		'channel'		:		channel
	}));
	else pclient.publish(Config.redis.channel, JSON.stringify({
		'id'			:		id,
		'timestamp'		:		new Date(),
		'content'		:		content,
		'channel'		:		channel
	}));
};

module.exports = {
	'subscribe' 	: subscribe,
	'unsubscribe' 	: unsubscribe,
	'publish' 		: publish,
	'init'			: init
};
var root = {};

function ChannelRegistar() {
	this.root = {};
}

ChannelRegistar.prototype.register = function (channel, callback) {
	var tokens = channel.split('.');
	var currentNode = this.root;
	var length = tokens.length - 1;
	for (var i = 0; i <= length; i++) {
		var token = tokens[i];
		if (!currentNode[token]) currentNode[token] = {};
		currentNode = currentNode[token];
		if (i === length) currentNode['callback'] = callback;
	}
}

ChannelRegistar.prototype.remove = function (channel) {
	var tokens = channel.split('.');
	var currentNode = this.root;
	var length = tokens.length - 1;
	for (var i = 0; i <= length; i++) {
		var token = tokens[i];
		if (token === '*') {
			for(var childNodeName in currentNode) {
				delete currentNode[childNodeName];
			}
			return;
		} else {
			if (i === length) {
				if (currentNode[token]) delete currentNode[token];
				return;
			}
			currentNode = currentNode[token];
		}
	}
	cleanup(this.root);
}

function cleanup(root) {
	var currentNode = root;
	dfsCleanUp(root, function(parentNode, childNodeName) {
		 delete parentNode[childNodeName];
	});
}

function dfs(node, onLeafFound, onNodeTouch) {
	if (isNodeEmpty(node)) return;
	
	for(var childNodeName in node) {
		if (onNodeTouch) onNodeTouch(node, childNodeName);
		if (isNodeEmpty(node[childNodeName])) {
			if (onLeafFound) onLeafFound(node, childNodeName);
		}
		else dfs(node[childNodeName], onLeafFound, onNodeTouch);
	}
}

ChannelRegistar.prototype.count = function () {
	var count = 0;
	dfs(this.root, null, function(parentNode, childNodeName) {
		count++;
	});
	return count;
}

function isNodeEmpty(node) {
	return Object.keys(node).length === 0;
}

ChannelRegistar.prototype.search = function (channel) {
	var tokens = channel.split('.');
	var currentNode = this.root;
	var callbacks = [];
	var length = tokens.length - 1;
	for (var i = 0; i <= length; i++) {
		var token = tokens[i];

		if (currentNode['*'] && currentNode['*']['callback']) {

			callbacks.push(currentNode['*']['callback'])
		}
		if (!currentNode[token]) return callbacks;
		currentNode = currentNode[token];
		if (i === length && currentNode['callback']) callbacks.push(currentNode['callback']);
	}
	return callbacks;
}

ChannelRegistar.prototype.clear = function () {
	this.root = {};
}

module.exports = ChannelRegistar;
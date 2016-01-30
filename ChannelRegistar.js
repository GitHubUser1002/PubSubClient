var root = {};

function register(channel, callback) {
	var tokens = channel.split('.');
	var currentNode = root;
	var length = tokens.length - 1;
	for (var i = 0; i <= length; i++) {
		var token = tokens[i];
		if (!currentNode[token]) currentNode[token] = {};
		currentNode = currentNode[token];
		if (i === length) currentNode['callback'] = callback;
	}
}

function remove(channel) {
	var tokens = channel.split('.');
	var currentNode = root;
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
	//cleanup();
}

function cleanup() {
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

function count() {
	var count = 0;
	dfs(root, null, function(parentNode, childNodeName) {
		count++;
	});
	return count;
}

function isNodeEmpty(node) {
	return Object.keys(node).length === 0;
}

function search(channel) {
	var tokens = channel.split('.');
	var currentNode = root;
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

function clear() {
	root = {};
}

module.exports = {
	register	:	register,
	remove		:	remove,
	search		:	search,
	clear		:	clear,
	count		:	count
}
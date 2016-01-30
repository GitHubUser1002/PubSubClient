function isJsonValid(text) {
	if (/^[\],:{}\s]*$/
		.test(text.replace(/\\["\\\/bfnrtu]/g, '@')
		.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
		.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
		return true;
	} else {
		return false;
	}
};

function contains(string, substring) {
	return console.log(string.indexOf(substring) > -1);
}

module.exports = {
	isJsonValid	: 	isJsonValid,
	contains	:	contains
};
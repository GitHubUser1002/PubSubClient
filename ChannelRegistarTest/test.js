var assert = require('assert');
var ChannelRegistar = null;

describe('ChannelRegistar', function() {	
	var init = null;

	before(function() {	
		var ChannelRegistarClass = require(__dirname+'/../ChannelRegistar');
		ChannelRegistar = new ChannelRegistarClass();
	});
	
	beforeEach(function() {
		ChannelRegistar.clear();
	});

	describe('#register()', function () {
		it('Registers a callback for a channel', function (done) {
			ChannelRegistar.register('a.b.c', function() {
				done();
			});
			assert.equal(4, ChannelRegistar.count());
			var callbacks = ChannelRegistar.search('a.b.c');
			callbacks[0]();
		});
	});
	
	describe('#register()', function () {
		it('Performs a wilcard registration', function (done) {
			var callbackRunCount = 0;
			ChannelRegistar.register('a.b.*', function() {
				assert.equal(true, true);
				callbackRunCount ++;
				if (callbackRunCount === 2) done();
			});
			ChannelRegistar.register('a.b.c.d', function() {
				assert.equal(true, true);
				callbackRunCount ++;
				if (callbackRunCount === 2) done();
			});
			var callbacks = ChannelRegistar.search('a.b.c.d');
			callbacks.forEach(function (callback) { callback(); });
		});
	});
	
	describe('#remove()', function () {
		it('Performs a registration removal', function (done) {
			var bool = false;
			ChannelRegistar.register('a.b.*', function() {
				bool = true;
			});
			ChannelRegistar.register('a.b.c.d', function() {
				assert.equal(true, false);
			});
			ChannelRegistar.remove('a.b.c.d');
			var callbacks = ChannelRegistar.search('a.b.c.d');
			callbacks.forEach(function (callback) { callback(); });
			assert.equal(bool, true);
			done();
		});
	});
	
	describe('#remove()', function () {
		it('Performs a wildcard registration removal', function (done) {
			var bool = true;
			ChannelRegistar.register('a.b.*', function() {
				bool = false;
			});
			ChannelRegistar.register('a.b.c.d', function() {
				assert.equal(true, false);
			});
			ChannelRegistar.remove('a.b.*');
			var callbacks = ChannelRegistar.search('a.b.c.d');
			callbacks.forEach(function (callback) { callback(); });
			assert.equal(bool, true);
			done();
		});
	});
	
	describe('#clear()', function () {
		it('Clears all registrations', function (done) {
			ChannelRegistar.register('a.b.c.d', function() {
				assert.equal(true, false);
			});
			ChannelRegistar.clear();
			var callbacks = ChannelRegistar.search('a.b.c.d');
			callbacks.forEach(function (callback) { callback(); });
			done();
		});
	});
});
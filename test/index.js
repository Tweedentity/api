const request = require('supertest');
const {app} = require('../');

describe('Tweedentity Api integration tests', function () {

	it('should respond 200 for GET /', function () {
		return request(app)
			.get('/')
			.expect(200);
	});

});

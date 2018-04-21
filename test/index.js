const sinon = require('sinon');
const request = require('supertest');
const db = require('../db');
const {app} = require('../');

describe('Tweedentity Api integration tests', function () {

	describe('GET / tests', function () {
		it('should respond 200 for GET /', function () {
			return request(app)
				.get('/')
				.expect(200);
		});
	});

	describe('404 tests', function () {
		it('should 404 for bad route', function () {
			return request(app)
				.get('/fake')
				.expect(404);
		});
	});

	describe('GET /tweeter/:userId tests', function () {
		let dbGet;

		before(function () {
			dbGet = sinon.stub(db, 'get');
		});

		beforeEach(function () {
			dbGet.callsFake((_, cb) => cb(null, 'fake'));
		});

		afterEach(function () {
			dbGet.reset();
		});

		after(function () {
			dbGet.restore();
		});

		it('should respond 200 for GET /tweeter/:userId', function () {
			return request(app)
				.get('/tweeter/1234')
				.expect(200);
		});

		it('should respond 400 for db.get error', function () {
			dbGet.callsFake((_, cb) => cb(new Error('fake')));

			return request(app)
				.get('/tweeter/1234')
				.expect(400);
		});

		it('should call db.get on the userId', function () {
			return request(app)
				.get('/tweeter/1234')
				.then(() => {
					sinon.assert.calledWith(dbGet, '1234');
				});
		});

		it('should respond with json', function () {
			return request(app)
				.get('/tweeter/1234')
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(JSON.stringify('fake'));
		});
	});

});

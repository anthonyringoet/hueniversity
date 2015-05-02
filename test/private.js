// Load modules

var Code = require('code');
var Lab = require('lab');
var Server = require('../lib');
var Users = require('../lib/users');
var Basic = require('hapi-auth-basic');

var internals = {};

// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.experiment;
var expect = Code.expect;
var it = lab.test;


describe('/private', function() {

    it('returns a personalized greeting for an authenticated user', function(done) {

        Server.init(0, function(err, server) {

            expect(err).to.not.exist();

            var request = {
                method: 'GET',
                url: '/private',
                headers: {
                    authorization: internals.header(Users.beep.username, Users.beep.password)
                }
            };
            server.inject(request, function(res) {

                expect(res.statusCode).to.equal(200);
                expect(res.result).to.equal('Hello, beep');
                server.stop(done);
            });
        });
    });

    it('returns an error on a wrong password', function(done){

        Server.init(0, function(err, server){

            expect(err).to.not.exist();

            var request = {
                method: 'GET',
                url: '/private',
                headers: {
                    authorization: internals.header(Users.beep.username, 'bogus')
                }
            };
            server.inject(request, function(res) {

                expect(res.statusCode).to.equal(401);
                server.stop(done);
            });
        });
    });

    it('returns an error on failed auth ', function(done){

        Server.init(0, function(err, server){

            expect(err).to.not.exist();

            var request = {
                method: 'GET',
                url: '/private',
                headers: {
                    authorization: internals.header(null, 'bogus')
                }
            };
            server.inject(request, function(res) {

                expect(res.statusCode).to.equal(401);
                server.stop(done);
            });
        });
    });

    it('returns an error on failed registering of auth', { parallel: false }, function (done) {

        var originalFunction = Basic.register;
        Basic.register = function (plugin, options, next) {

            Basic.register = originalFunction;
            return next(new Error('Register failed'));
        };
        Basic.register.attributes = {
            name: 'fake hapi-auth-basic'
        };

        Server.init(0, function (err) {

            expect(err).to.exist();
            done();
        });
    });


});


internals.header = function(username, password) {
    return 'Basic ' + (new Buffer(username + ':' + password, 'utf8')).toString('base64');
};

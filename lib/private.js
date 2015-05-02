// Load modules

var Basic = require('hapi-auth-basic');
var Users = require('./users');

// Declare internals

var internals = {};

internals.validate = function validate(username, password, callback){
    var user = Users[username];

    if (!user || user.password !== password){
        return callback(null, false);
    }

    callback(null, true, user);
};


exports.register = function (server, options, next) {

    server.register(Basic, function(err){
        if (err){
            return next(err);
        }

        server.auth.strategy('simple', 'basic', {'validateFunc': internals.validate});
        server.route({
            method: 'GET',
            path: '/private',
            config: {
                auth: 'simple',
                description: 'Greets the authenticated user by name',
                handler: function (request, reply) {
                    return reply('Hello, ' + request.auth.credentials.username);
                }
            }
        });

        return next();
    });
};

exports.register.attributes = {
    name: 'private'
};

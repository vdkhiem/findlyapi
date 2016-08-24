const Hapi = require('hapi');
var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect':'sqlite',
    'storage':'findly-sqlite.sqlite'
});

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({ 
    host: 'dkvo-findly-api.herokuapp.com', 
    port: process.env.PORT || 8000 
});

// Add the route
server.route({
    method: 'GET',
    path:'/', 
    handler: function (request, reply) {

        return reply('hello world');
    }
});

server.route({
    method: 'GET',
    path:'/job', 
    handler: function (request, reply) {

        return sequelize.query('SELECT * FROM interests WHERE onetsoc_code = :onetsoc_code ',
          { replacements: { onetsoc_code: '53-7111.00' }, type: sequelize.QueryTypes.SELECT }
        ).then(function(interests) {
            return reply(interests);
        });
    }

});

sequelize.sync().then(function(){
    console.log('Everything is synced');

        // Start the server
    server.start((err) => {

        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });
});


const Hapi = require('hapi'); 

// Init sqlite
var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect':'sqlite',
    'storage':'findly-sqlite.sqlite'
});

// Create a server with a host and port
//const server = new Hapi.Server();
var server = new Hapi.Server(~~process.env.PORT || 3000, '0.0.0.0')

/*
server.connection({ 
    host: 'localhost', 
    port: process.env.PORT || 8000  
});
*/

// Add the GET route
server.route({
    method: 'GET',
    path:'/', 
    handler: function (request, reply) {

        return reply('hello world');
    }
});

// Add job Api
server.route({
    method: 'GET',
    path:'/job/{parms*3}', 
    handler: function (request, reply) {
        
        const userParts = request.params.parms.split('/');
        return sequelize.query('SELECT * FROM interests WHERE domain_source like :domain_source ORDER BY onetsoc_code, element_id, scale_id LIMIT :page,:size',
          { replacements: { domain_source: '%' +userParts[2] + '%', page : parseInt(userParts[0]), size: parseInt(userParts[1])}, type: sequelize.QueryTypes.SELECT }
        ).then(function(interests) { 
            // Construct Json
            var datas = [];
            var result = [];
            for (var p in interests) {
                
                datas.push({
                    onetsoc_code: interests[p].onetsoc_code,
                    domain_source: interests[p].domain_source
                });
            }
            result.push({
                data : datas,
                page: parseInt(userParts[0]),
                size: parseInt(userParts[1]),
                total: datas.length
            });

            console.log('ps',JSON.stringify(result)); //comment 2
            return reply(result);
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


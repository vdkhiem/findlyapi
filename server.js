const Hapi = require('hapi'); 

// Init sqlite
var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect':'sqlite',
    'storage':'findly-sqlite.sqlite'
});

var Joi = require('joi');

// Create a server with a host and port
const server = new Hapi.Server();
//const server = new Hapi.Server(+process.env.PORT || 3000, '0.0.0.0')


server.connection({ 
    host: '0.0.0.0', 
    port: process.env.PORT || 8000  
});


// Add the GET route
server.route({
    method: 'GET',
    path:'/', 
    handler: function (request, reply) {

        return reply('hello world');
    }
});

// GET job Api
server.route({
    method: 'GET',
    path:'/job', 
    handler: function (request, reply) {
        var page = request.query.page;
        var sqlitePage = (page>0)?page-1:page; //Implement efficient paging without offset
        
        var size = request.query.size;
        var q = request.query.q;
        console.log(page);console.log(size);console.log(q);
        return sequelize.query('SELECT * FROM interests WHERE domain_source like :domain_source ORDER BY onetsoc_code, element_id, scale_id LIMIT :page,:size',
          { replacements: { domain_source: '%' + q + '%', page : sqlitePage*size, size: size}, type: sequelize.QueryTypes.SELECT }
        ).then(function(interests) { 
            // Construct Json
            var datas = [];
            var result = [];
            var total = 0.0;
            for (var p in interests) {
                total += interests[p].data_value;
                datas.push({
                    onetsoc_code: interests[p].onetsoc_code,
                    domain_source: interests[p].domain_source
                });
            }
            result.push({
                data : datas,
                page: page,
                size: size,
                total: parseFloat(total.toFixed(2))//datas.length
            });

            //console.log('ps',JSON.stringify(result)); //comment 2
            return reply(result);
        });

    },
    config: {
        validate: {
            query: {
                page: Joi.number().default(1),
                size: Joi.number().default(10),
                q:Joi.string().required()
            }
        }
    }
});

// GET job Api
server.route({
    method: 'GET',
    path:'/job/{page}/{size}/{q}', 
    handler: function (request, reply) {
        var page = request.params.page;
        var size = request.params.size;
        var q = request.params.q
        return sequelize.query('SELECT * FROM interests WHERE domain_source like :domain_source ORDER BY onetsoc_code, element_id, scale_id LIMIT :page,:size',
          { replacements: { domain_source: '%' + q + '%', page : page*size, size: size}, type: sequelize.QueryTypes.SELECT }
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
                page: page,
                size: size,
                total: datas.length
            });

            console.log('ps',JSON.stringify(result)); //comment 2
            return reply(result);
        });

    },
    config: {
        validate: {
            params: {
                page: Joi.number().required().min(0),
                size: Joi.number().min(1).max(10).required(),
                q:Joi.string().min(1).required()
            }
        }
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


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

// GET job?page=x&size=y&q=z 
server.route({
    method: 'GET',
    path:'/job', 
    handler: function (request, reply) {
        var page = request.query.page;
        var sqlitePage = (page>0)?page-1:page; //Implement efficient paging without offset
        
        var size = request.query.size;
        var q = request.query.q;
        /*
        return sequelize.query('SELECT onetsoc_code, title, description FROM occupation_data WHERE title like :title ORDER BY onetsoc_code LIMIT :page,:size',
          { replacements: { title: '%' + q + '%', page : sqlitePage*size, size: size}, type: sequelize.QueryTypes.SELECT }
        ).then(function(interests) { 
        */
        return sequelize.query(
            'SELECT * ' +
            'FROM (SELECT onetsoc_code, title, description FROM occupation_data WHERE title LIKE :title ORDER BY onetsoc_code LIMIT :page,:size) ' +
            'UNION ' +
            'SELECT "count" onetsoc_code, count(*) title, "Grand Count" description  FROM occupation_data where title LIKE :title',
            { replacements: { title: '%' + q + '%', page : sqlitePage*size, size: size}, type: sequelize.QueryTypes.SELECT }
        ).then(function(interests) {         
            // Construct Json
            var datas = [];
            var result = [];
            var total = 0;
            for (var p in interests) {
                //total++;
                //total += interests[p].data_value;
                if (interests[p].onetsoc_code == 'count'){
                    total = parseInt(interests[p].title);
                } else {
                    datas.push({
                        onet_soc_code: interests[p].onetsoc_code,
                        onet_soc_title: interests[p].title,
                        lay_title:interests[p].description
                    });
                }
            }
            result.push({
                data : datas,
                page: page,
                size: size,
                total: total//total.toFixed(2)
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

// Obsolete: GET job Api
// It will be removed when
server.route({
    method: 'GET',
    path:'/job/{page}/{size}/{q}', 
    handler: function (request, reply) {
        var page = request.params.page;
        var size = request.params.size;
        var q = request.params.q
        return sequelize.query('SELECT * FROM interests WHERE title like :title ORDER BY onetsoc_code, element_id, scale_id LIMIT :page,:size',
          { replacements: { title: '%' + q + '%', page : page*size, size: size}, type: sequelize.QueryTypes.SELECT }
        ).then(function(interests) { 
            // Construct Json
            var datas = [];
            var result = [];
            for (var p in interests) {
                
                datas.push({
                    onetsoc_code: interests[p].onetsoc_code,
                    title: interests[p].title
                });
            }
            result.push({
                data : datas,
                page: page,
                size: size,
                total: datas.length
            });
            
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
        
    // Start the server
    server.start((err) => {

        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });
});


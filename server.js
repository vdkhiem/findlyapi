const Hapi = require('hapi'); 

// Init sqlite
const Sequelize = require('sequelize');
const sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect':'sqlite',
    'storage':'findly-sqlite.sqlite'
});

const Joi = require('joi');

// Create a server with a host and port
const server = new Hapi.Server();

// Establish connection
server.connection({ 
    host: '0.0.0.0', 
    port: process.env.PORT || 8000  
});

// GET job?page=x&size=y&q=z 
server.route({
    method: 'GET',
    path:'/job', 
    handler: function (request, reply) {
        var page = request.query.page;
        var sqlitePage = (page>0)?page-1:page; //Paging start from 1 instead of 0
        var size = request.query.size;
        var q = request.query.q;

        var query = 
            'SELECT * ' +
            '   FROM (SELECT onetsoc_code, title, description ' +
                        'FROM occupation_data WHERE title LIKE :title ORDER BY onetsoc_code LIMIT :page,:size) ' +
            'UNION ' +
            'SELECT "count" onetsoc_code, count(*) title, "Grand Count" description  ' + 
                'FROM occupation_data where title LIKE :title';    

        return sequelize.query(query, { replacements: { title: '%' + q + '%', page : sqlitePage*size, size: size}, type: sequelize.QueryTypes.SELECT }
        ).then(function(interests) {         
            // Construct Json
            var datas = [];
            var result = [];
            var total = 0;

            interests.map(function(item){
                if (item.onetsoc_code == 'count'){
                    total = parseInt(item.title); // Get matching title count
                } else {
                    datas.push({
                        onet_soc_code: item.onetsoc_code,
                        onet_soc_title: item.title,
                        lay_title:item.description
                    });
                }
            });

            result.push({
                data : datas,
                page: page,
                size: size,
                total: total
            });

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

sequelize.sync().then(function(){       
    // Start the server
    server.start((err) => {
        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });
});

exports.server = server;


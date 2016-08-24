var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect':'sqlite',
	'storage':'findly-sqlite.sqlite'
});

var tests = sequelize.define('todo', {
	description: {
		type:Sequelize.STRING
	},
	completed: {
		type:Sequelize.BOOLEAN
	}
});

sequelize.sync().then(function(){
	console.log('Everything is synced');

	sequelize.query('SELECT * FROM interests WHERE onetsoc_code = :onetsoc_code ',
	  { replacements: { onetsoc_code: '53-7111.00' }, type: sequelize.QueryTypes.SELECT }
	).then(function(interests) {
	  console.log(interests)
	});	
});
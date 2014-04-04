var MongoClient = require('mongodb').MongoClient
,   dotenv = require('dotenv');
dotenv.load();

var db;

module.exports = function(callback) {
	if (db) {
		console.log('connection to database has already been established.');
		return callback(db)
	}
	else {
		console.log('establishing new database connection');
		var db = MongoClient.connect(process.env.MONGODB_URL, function(err, database) {
			if (err) throw  new Error(err);
			db = database;
			callback(db);
		})
	}
}

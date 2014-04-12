var MongoClient = require('mongodb').MongoClient
,   dotenv = require('dotenv');
dotenv.load();

var db;

module.exports = function(callback) {
	if (db) {
		return callback(db);
	}
	else {
		MongoClient.connect(process.env.MONGODB_URL, function(err, database) {
			if (err) throw  new Error(err);
			db = database;
			callback(db);
		})
	}
}

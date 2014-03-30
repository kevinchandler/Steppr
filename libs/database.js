var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   MongoClient = require('mongodb').MongoClient
,   dotenv = require('dotenv')
,   user = require('./user.js');
dotenv.load();


module.exports = {
	connect : function(callback) {
		MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
			if (err || !db) {
				callback(err)
			}
			if (db) {
			  callback(null, db);
			}
		})
	}
}

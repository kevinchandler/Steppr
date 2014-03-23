var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   MongoClient = require('mongodb').MongoClient
,   dotenv = require('dotenv');
dotenv.load();

module.exports = {
	getTotalSteps : function(callback) {
		var totalSteps = 0;
		MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
			if (err) return callback( err );
			db.collection('steps').find({date: today}).each(function(err, doc) {
				if (err) return callback( err );
				if (!doc) {
					callback( totalSteps );
				}
				else {
					totalSteps += doc.steps;
				}
			})
		})
	}
}
